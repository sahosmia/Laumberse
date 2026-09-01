<?php

use App\Models\Client;
use App\Models\ClientActivity;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\GlobalSetting;
use App\Models\Invoice;
use App\Models\User;

test('guests are redirected to the login page', function () {
    $this->get('/dashboard')->assertRedirect('/login');
});

test('authenticated users can visit the dashboard', function () {
    $this->actingAs($user = User::factory()->create());

    $this->get('/dashboard')->assertOk();
});

test('dashboard stats only include invoices within the selected date range', function () {
    $user = User::factory()->create();
    $client = Client::create(['name' => 'John Doe', 'phone' => '123456789']);

    Invoice::create([
        'invoice_uuid' => 'INV-IN-RANGE',
        'date' => '2026-06-15',
        'client_id' => $client->id,
        'total' => 100,
        'paid' => 100,
        'due' => 0,
        'status' => 'Processing',
        'method' => 'Cash',
    ]);

    Invoice::create([
        'invoice_uuid' => 'INV-OUT-OF-RANGE',
        'date' => '2026-01-01',
        'client_id' => $client->id,
        'total' => 500,
        'paid' => 500,
        'due' => 0,
        'status' => 'Processing',
        'method' => 'Cash',
    ]);

    $response = $this->actingAs($user)->get('/dashboard?from=2026-06-01&to=2026-06-30');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('stats.total_orders', 1)
        ->where('stats.total_revenue', 100)
    );
});

test('dashboard defaults to this month and reports the resolved period', function () {
    $user = User::factory()->create();
    $client = Client::create(['name' => 'John Doe', 'phone' => '123456789']);

    Invoice::create([
        'invoice_uuid' => 'INV-THIS-MONTH',
        'date' => now()->toDateString(),
        'client_id' => $client->id,
        'total' => 100,
        'paid' => 100,
        'due' => 0,
        'status' => 'Processing',
        'method' => 'Cash',
    ]);

    Invoice::create([
        'invoice_uuid' => 'INV-TWO-MONTHS-AGO',
        'date' => now()->subMonths(2)->toDateString(),
        'client_id' => $client->id,
        'total' => 500,
        'paid' => 500,
        'due' => 0,
        'status' => 'Processing',
        'method' => 'Cash',
    ]);

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('filters.period', 'this_month')
        ->where('stats.total_orders', 1)
        ->where('stats.total_revenue', 100)
    );
});

test('dashboard period=today only includes invoices from today', function () {
    $user = User::factory()->create();
    $client = Client::create(['name' => 'John Doe', 'phone' => '123456789']);

    Invoice::create([
        'invoice_uuid' => 'INV-TODAY',
        'date' => now()->toDateString(),
        'client_id' => $client->id,
        'total' => 150,
        'paid' => 150,
        'due' => 0,
        'status' => 'Processing',
        'method' => 'Cash',
    ]);

    Invoice::create([
        'invoice_uuid' => 'INV-YESTERDAY',
        'date' => now()->subDay()->toDateString(),
        'client_id' => $client->id,
        'total' => 250,
        'paid' => 250,
        'due' => 0,
        'status' => 'Processing',
        'method' => 'Cash',
    ]);

    $response = $this->actingAs($user)->get('/dashboard?period=today');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('stats.total_orders', 1)
        ->where('stats.total_revenue', 150)
    );
});

test('dashboard period=last_month excludes invoices from this month', function () {
    $user = User::factory()->create();
    $client = Client::create(['name' => 'John Doe', 'phone' => '123456789']);

    Invoice::create([
        'invoice_uuid' => 'INV-LAST-MONTH',
        'date' => now()->subMonthNoOverflow()->startOfMonth()->addDays(2)->toDateString(),
        'client_id' => $client->id,
        'total' => 300,
        'paid' => 300,
        'due' => 0,
        'status' => 'Processing',
        'method' => 'Cash',
    ]);

    Invoice::create([
        'invoice_uuid' => 'INV-THIS-MONTH-2',
        'date' => now()->toDateString(),
        'client_id' => $client->id,
        'total' => 400,
        'paid' => 400,
        'due' => 0,
        'status' => 'Processing',
        'method' => 'Cash',
    ]);

    $response = $this->actingAs($user)->get('/dashboard?period=last_month');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('stats.total_orders', 1)
        ->where('stats.total_revenue', 300)
    );
});

test('dashboard period=this_year excludes invoices from last year', function () {
    $user = User::factory()->create();
    $client = Client::create(['name' => 'John Doe', 'phone' => '123456789']);

    Invoice::create([
        'invoice_uuid' => 'INV-THIS-YEAR',
        'date' => now()->toDateString(),
        'client_id' => $client->id,
        'total' => 600,
        'paid' => 600,
        'due' => 0,
        'status' => 'Processing',
        'method' => 'Cash',
    ]);

    Invoice::create([
        'invoice_uuid' => 'INV-LAST-YEAR',
        'date' => now()->subYear()->toDateString(),
        'client_id' => $client->id,
        'total' => 700,
        'paid' => 700,
        'due' => 0,
        'status' => 'Processing',
        'method' => 'Cash',
    ]);

    $response = $this->actingAs($user)->get('/dashboard?period=this_year');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('stats.total_orders', 1)
        ->where('stats.total_revenue', 600)
    );
});

test('dashboard pending count only includes Processing invoices', function () {
    // Regression guard for the InvoiceStatus::Processing enum fix (P1.6): 'pending' must count
    // exactly the invoices whose status is Processing, not every invoice regardless of status.
    $user = User::factory()->create();
    $client = Client::create(['name' => 'John Doe', 'phone' => '123456789']);

    Invoice::create([
        'invoice_uuid' => 'INV-PENDING-1', 'date' => now()->toDateString(), 'client_id' => $client->id,
        'total' => 100, 'paid' => 0, 'due' => 100, 'status' => 'Processing', 'method' => 'Cash',
    ]);
    Invoice::create([
        'invoice_uuid' => 'INV-PENDING-2', 'date' => now()->toDateString(), 'client_id' => $client->id,
        'total' => 200, 'paid' => 0, 'due' => 200, 'status' => 'Processing', 'method' => 'Cash',
    ]);
    Invoice::create([
        'invoice_uuid' => 'INV-DELIVERED', 'date' => now()->toDateString(), 'client_id' => $client->id,
        'total' => 300, 'paid' => 300, 'due' => 0, 'status' => 'Delivered', 'method' => 'Cash',
    ]);

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->where('stats.pending', 2));
});

test('dashboard reports transportation cost broken down by business and delivery', function () {
    $user = User::factory()->create();

    $business = ExpenseCategory::create(['name' => 'Business Transportation', 'description' => 'x']);
    $delivery = ExpenseCategory::create(['name' => 'Delivery Transportation', 'description' => 'x']);
    GlobalSetting::set('business_transportation_category_id', $business->id);
    GlobalSetting::set('delivery_transportation_category_id', $delivery->id);

    Expense::create([
        'expense_category_id' => $business->id,
        'amount' => 3000,
        'payment_method' => 'Cash',
        'date' => now()->format('Y-m-d'),
        'description' => 'Business transport',
    ]);
    Expense::create([
        'expense_category_id' => $delivery->id,
        'amount' => 2000,
        'payment_method' => 'Cash',
        'date' => now()->format('Y-m-d'),
        'description' => 'Delivery transport',
    ]);

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('transportExpense.business', 3000)
        ->where('transportExpense.delivery', 2000)
        ->where('transportExpense.total', 5000)
    );
});

test('dashboard splits pending activities into meetings vs follow-ups', function () {
    $user = User::factory()->create();
    $client = Client::create(['name' => 'John Doe', 'phone' => '123456789']);

    ClientActivity::create([
        'outlet_id' => $user->outlet_id, 'client_id' => $client->id, 'type' => 'meeting',
        'scheduled_at' => now()->addDay(), 'status' => 'pending',
    ]);
    ClientActivity::create([
        'outlet_id' => $user->outlet_id, 'client_id' => $client->id, 'type' => 'follow_up',
        'scheduled_at' => now()->subDay(), 'status' => 'pending',
    ]);
    // Neither done nor cancelled activities count regardless of their type/date.
    ClientActivity::create([
        'outlet_id' => $user->outlet_id, 'client_id' => $client->id, 'type' => 'meeting',
        'scheduled_at' => now()->subDay(), 'status' => 'done',
    ]);

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('meetings.total', 1)
        ->has('meetings.items', 1)
        ->where('followUps.total', 1)
        ->has('followUps.items', 1)
    );
});

test('dashboard meeting widgets are limited and omitted when empty', function () {
    $user = User::factory()->create();
    $client = Client::create(['name' => 'John Doe', 'phone' => '123456789']);

    for ($i = 0; $i < 8; $i++) {
        ClientActivity::create([
            'outlet_id' => $user->outlet_id, 'client_id' => $client->id, 'type' => 'meeting',
            'scheduled_at' => now()->addDays($i + 1), 'status' => 'pending',
        ]);
    }

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('meetings.total', 8)
        ->has('meetings.items', 5) // capped, even though 8 exist
        ->where('followUps.total', 0)
        ->has('followUps.items', 0)
    );
});
