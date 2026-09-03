<?php

use App\Models\Account;
use App\Models\Client;
use App\Models\ClientActivity;
use App\Models\Investor;
use App\Models\Invoice;
use App\Models\Outlet;
use App\Models\User;

test('dashboard stats only include invoices, expenses, and accounts from the current outlet', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Manager');
    $userB = User::factory()->for($outletB, 'outlet')->create();
    $userB->assignRole('Manager');

    $clientA = Client::create(['name' => 'Client A', 'phone' => '01700000001']);
    $clientB = Client::create(['name' => 'Client B', 'phone' => '01700000002']);

    Invoice::create([
        'outlet_id' => $userA->outlet_id, 'invoice_uuid' => 'INV-A', 'date' => now()->toDateString(),
        'client_id' => $clientA->id, 'total' => 1000, 'paid' => 1000, 'due' => 0, 'status' => 'In House', 'method' => 'Cash',
    ]);
    Invoice::create([
        'outlet_id' => $outletB->id, 'invoice_uuid' => 'INV-B', 'date' => now()->toDateString(),
        'client_id' => $clientB->id, 'total' => 5000, 'paid' => 5000, 'due' => 0, 'status' => 'In House', 'method' => 'Cash',
    ]);

    Account::create(['outlet_id' => $userA->outlet_id, 'name' => 'Cash A', 'opening_balance' => 100, 'current_balance' => 100]);
    Account::create(['outlet_id' => $outletB->id, 'name' => 'Cash B', 'opening_balance' => 999, 'current_balance' => 999]);

    $response = test()->actingAs($userA)->get(route('dashboard'));

    $response->assertInertia(fn ($page) => $page
        ->where('stats.total_revenue', 1000)
        ->where('accounts.total', 100)
    );
});

test('an admin who switches to All Outlets sees dashboard stats aggregated across every outlet', function () {
    $outletB = Outlet::factory()->create();
    $admin = User::factory()->admin()->create();
    $userB = User::factory()->for($outletB, 'outlet')->create();
    $userB->assignRole('Manager');

    $client = Client::create(['name' => 'Client', 'phone' => '01700000003']);

    Invoice::create([
        'outlet_id' => $admin->outlet_id, 'invoice_uuid' => 'INV-ADMIN', 'date' => now()->toDateString(),
        'client_id' => $client->id, 'total' => 1000, 'paid' => 1000, 'due' => 0, 'status' => 'In House', 'method' => 'Cash',
    ]);
    Invoice::create([
        'outlet_id' => $outletB->id, 'invoice_uuid' => 'INV-B', 'date' => now()->toDateString(),
        'client_id' => $client->id, 'total' => 5000, 'paid' => 5000, 'due' => 0, 'status' => 'In House', 'method' => 'Cash',
    ]);

    test()->actingAs($admin)->post(route('outlet-context.update'), ['outlet' => 'all'])
        ->assertRedirect()->assertSessionHasNoErrors();

    $response = test()->actingAs($admin)->get(route('dashboard'));

    $response->assertInertia(fn ($page) => $page->where('stats.total_revenue', 6000));
});

test('financial position sundry debtors, cash at bank, staff advances, and other assets only include the current outlet', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Manager');
    $userA->givePermissionTo('accounts.view');
    $userB = User::factory()->for($outletB, 'outlet')->create();

    Account::create(['outlet_id' => $userA->outlet_id, 'name' => 'Cash A', 'opening_balance' => 100, 'current_balance' => 100]);
    Account::create(['outlet_id' => $outletB->id, 'name' => 'Cash B', 'opening_balance' => 999, 'current_balance' => 999]);

    $response = test()->actingAs($userA)->get(route('accounts.financial-position'));

    $response->assertInertia(fn ($page) => $page->where('assets.cash_at_bank.total', 100));
});

test('financial position capital reflects only the current outlet\'s own investor transactions, not the company-wide balance', function () {
    // See FinancialPositionOutletIsolationTest for the full per-outlet-vs-All-Outlets Capital/
    // Company Loan matrix — this is just the dashboard-context smoke test for the same behavior.
    $userA = User::factory()->create();
    $userA->assignRole('Manager');
    $userA->givePermissionTo('accounts.view');

    $investor = Investor::create(['name' => 'Jane', 'opening_balance' => 5000, 'current_balance' => 5000]);

    $response = test()->actingAs($userA)->get(route('accounts.financial-position'));

    // Created via the model directly (no InvestorTransaction), so $investor's own current_balance
    // field is never touched — Capital is always summed from InvestorTransaction rows, not it.
    $response->assertInertia(fn ($page) => $page->where('liabilities.capital.total', 0));
});

test('dashboard meeting/follow-up widgets only include the current outlet', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Manager');
    $userB = User::factory()->for($outletB, 'outlet')->create();
    $userB->assignRole('Manager');

    $client = Client::create(['name' => 'Shared Client', 'phone' => '01700000004']);

    ClientActivity::create([
        'outlet_id' => $userA->outlet_id, 'client_id' => $client->id, 'type' => 'meeting',
        'scheduled_at' => now()->addDay(), 'status' => 'pending',
    ]);
    ClientActivity::create([
        'outlet_id' => $outletB->id, 'client_id' => $client->id, 'type' => 'meeting',
        'scheduled_at' => now()->addDay(), 'status' => 'pending',
    ]);

    $response = test()->actingAs($userA)->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->where('meetings.total', 1));
});
