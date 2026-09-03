<?php

use App\Models\Account;
use App\Models\Category;
use App\Models\Client;
use App\Models\Invoice;
use App\Models\Outlet;
use App\Models\Product;
use App\Models\User;

/**
 * Security matrix for the flagship outlet-scoped module. Invoices is the primary example used
 * throughout the Multi-Outlet ticket, so this file is the reference for how every other
 * outlet-scoped module (Expenses, Employees, Assets, Accounts, Meetings) should be tested once
 * scoped the same way.
 */
function makeInvoiceFor(User $user, ?Outlet $outlet = null, array $overrides = []): Invoice
{
    $category = Category::create(['name' => 'Cat-'.uniqid(), 'slug' => 'cat-'.uniqid()]);
    $product = Product::create(['name' => 'Product-'.uniqid(), 'category_id' => $category->id, 'price' => 100]);
    $client = Client::create(['name' => 'Client-'.uniqid(), 'phone' => '017'.random_int(10000000, 99999999)]);
    // Must match $user's own outlet — Account defaults to the oldest outlet otherwise, which
    // would fail the account_id/outlet_id cross-check in StoreInvoiceRequest for any $user not
    // on that oldest outlet.
    $account = Account::create(['outlet_id' => $user->outlet_id, 'name' => 'Cash-'.uniqid(), 'opening_balance' => 0, 'current_balance' => 0]);

    $data = array_merge([
        'date' => now()->format('Y-m-d'),
        'client_id' => $client->id,
        'create_new_client' => false,
        'total' => 100,
        'paid' => 100,
        'due' => 0,
        'status' => 'In House',
        'method' => 'Cash',
        'account_id' => $account->id,
        'discount_type' => 'Fixed',
        'discount_amount' => 0,
        'items' => [['productId' => $product->id, 'qty' => 1, 'price' => 100]],
    ], $overrides);

    test()->actingAs($user)->post(route('invoices.store'), $data)->assertSessionHasNoErrors();

    return Invoice::latest('id')->first();
}

test('a user only sees invoices from their own outlet in the index', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Manager');
    $userB = User::factory()->for($outletB, 'outlet')->create();
    $userB->assignRole('Manager');

    $invoiceA = makeInvoiceFor($userA);
    $invoiceB = makeInvoiceFor($userB);

    $response = test()->actingAs($userA)->get(route('history'));

    $uuids = collect($response->viewData('page')['props']['invoices']['data'])->pluck('invoice_uuid');
    expect($uuids)->toContain($invoiceA->invoice_uuid);
    expect($uuids)->not->toContain($invoiceB->invoice_uuid);
});

test('a user cannot view another outlet\'s invoice directly by id', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Manager');
    $userB = User::factory()->for($outletB, 'outlet')->create();
    $userB->assignRole('Manager');

    $invoiceB = makeInvoiceFor($userB);

    test()->actingAs($userA)->get(route('invoices.show', $invoiceB))->assertNotFound();
});

test('a user cannot open the edit page for another outlet\'s invoice', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Manager');
    $userB = User::factory()->for($outletB, 'outlet')->create();
    $userB->assignRole('Manager');

    $invoiceB = makeInvoiceFor($userB);

    test()->actingAs($userA)->get(route('invoices.edit', $invoiceB))->assertNotFound();
});

test('a user cannot update another outlet\'s invoice', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Manager');
    $userB = User::factory()->for($outletB, 'outlet')->create();
    $userB->assignRole('Manager');

    $invoiceB = makeInvoiceFor($userB);
    $originalTotal = $invoiceB->total;

    $product = Product::first();
    test()->actingAs($userA)->put(route('invoices.update', $invoiceB), [
        'date' => now()->format('Y-m-d'),
        'client_id' => $invoiceB->client_id,
        'total' => 999,
        'paid' => 0,
        'due' => 999,
        'status' => 'In House',
        'discount_type' => 'Fixed',
        'discount_amount' => 0,
        'items' => [['productId' => $product->id, 'qty' => 1, 'price' => 999]],
    ])->assertNotFound();

    expect((float) $invoiceB->fresh()->total)->toEqual((float) $originalTotal);
});

test('a user cannot delete another outlet\'s invoice', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Manager');
    $userB = User::factory()->for($outletB, 'outlet')->create();
    $userB->assignRole('Manager');

    $invoiceB = makeInvoiceFor($userB);

    test()->actingAs($userA)->delete(route('invoices.destroy', $invoiceB))->assertNotFound();

    expect(Invoice::find($invoiceB->id))->not->toBeNull();
});

test('a user cannot change the status of another outlet\'s invoice', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Manager');
    $userB = User::factory()->for($outletB, 'outlet')->create();
    $userB->assignRole('Manager');

    $invoiceB = makeInvoiceFor($userB);

    test()->actingAs($userA)
        ->patch(route('invoices.update-status', $invoiceB), ['status' => 'Delivered'])
        ->assertNotFound();
});

test('a user cannot change the payment status of another outlet\'s invoice', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Manager');
    $userB = User::factory()->for($outletB, 'outlet')->create();
    $userB->assignRole('Manager');

    $invoiceB = makeInvoiceFor($userB);

    test()->actingAs($userA)
        ->patch(route('invoices.update-payment-status', $invoiceB), ['payment_status' => 'Unpaid'])
        ->assertNotFound();
});

test('a user cannot print another outlet\'s invoice', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Manager');
    $userB = User::factory()->for($outletB, 'outlet')->create();
    $userB->assignRole('Manager');

    $invoiceB = makeInvoiceFor($userB);

    test()->actingAs($userA)->get(route('invoices.print', $invoiceB))->assertNotFound();
});

test('a user cannot pos-print another outlet\'s invoice', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Manager');
    $userB = User::factory()->for($outletB, 'outlet')->create();
    $userB->assignRole('Manager');

    $invoiceB = makeInvoiceFor($userB);

    test()->actingAs($userA)->get(route('invoices.pos-print', $invoiceB))->assertNotFound();
});

test('a user can pos-print their own outlet\'s invoice', function () {
    $userA = User::factory()->create();
    $userA->assignRole('Manager');

    $invoiceA = makeInvoiceFor($userA);

    test()->actingAs($userA)->get(route('invoices.pos-print', $invoiceA))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('invoices/pos')->where('invoice.invoice_uuid', $invoiceA->invoice_uuid));
});

test('an invoice is always assigned to the creator\'s own outlet, even if a different outlet_id is forged in the payload', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Manager');

    $invoice = makeInvoiceFor($userA, overrides: ['outlet_id' => $outletB->id]);

    expect($invoice->outlet_id)->toBe($userA->outlet_id)
        ->and($invoice->outlet_id)->not->toBe($outletB->id);
});

test('invoice search only returns results from the current outlet scope', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Manager');
    $userA->givePermissionTo('clients.view', 'catalog.view', 'notes.view');
    $userB = User::factory()->for($outletB, 'outlet')->create();
    $userB->assignRole('Manager');

    $invoiceA = makeInvoiceFor($userA);
    $invoiceB = makeInvoiceFor($userB);

    $response = test()->actingAs($userA)->getJson(route('search', ['q' => 'INV-']));

    $ids = collect($response->json('invoices'))->pluck('id');
    expect($ids)->toContain($invoiceA->id);
    expect($ids)->not->toContain($invoiceB->id);
});

test('an admin defaults to their own assigned outlet and does not automatically see every outlet', function () {
    $outletB = Outlet::factory()->create();
    $admin = User::factory()->admin()->create();
    $userB = User::factory()->for($outletB, 'outlet')->create();
    $userB->assignRole('Manager');

    $invoiceAdmin = makeInvoiceFor($admin);
    $invoiceB = makeInvoiceFor($userB);

    $response = test()->actingAs($admin)->get(route('history'));

    $uuids = collect($response->viewData('page')['props']['invoices']['data'])->pluck('invoice_uuid');
    expect($uuids)->toContain($invoiceAdmin->invoice_uuid);
    expect($uuids)->not->toContain($invoiceB->invoice_uuid);
});

test('an admin who switches to All Outlets sees invoices from every outlet', function () {
    $outletB = Outlet::factory()->create();
    $admin = User::factory()->admin()->create();
    $userB = User::factory()->for($outletB, 'outlet')->create();
    $userB->assignRole('Manager');

    $invoiceAdmin = makeInvoiceFor($admin);
    $invoiceB = makeInvoiceFor($userB);

    test()->actingAs($admin)->post(route('outlet-context.update'), ['outlet' => 'all'])->assertRedirect();

    $response = test()->actingAs($admin)->get(route('history'));

    $uuids = collect($response->viewData('page')['props']['invoices']['data'])->pluck('invoice_uuid');
    expect($uuids)->toContain($invoiceAdmin->invoice_uuid);
    expect($uuids)->toContain($invoiceB->invoice_uuid);
});

test('an admin who switches to a specific outlet only sees that outlet\'s invoices', function () {
    $outletB = Outlet::factory()->create();
    $admin = User::factory()->admin()->create();
    $userB = User::factory()->for($outletB, 'outlet')->create();
    $userB->assignRole('Manager');

    $invoiceAdmin = makeInvoiceFor($admin);
    $invoiceB = makeInvoiceFor($userB);

    // 'outlet' must be a string — $this->post() preserves PHP types in the payload (unlike a real
    // browser form submission), and the route's `outlet => required|string` rule silently rejects
    // a raw int, so an unqualified assertRedirect() here wouldn't catch a failed switch.
    test()->actingAs($admin)->post(route('outlet-context.update'), ['outlet' => (string) $outletB->id])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $response = test()->actingAs($admin)->get(route('history'));

    $uuids = collect($response->viewData('page')['props']['invoices']['data'])->pluck('invoice_uuid');
    expect($uuids)->toContain($invoiceB->invoice_uuid);
    expect($uuids)->not->toContain($invoiceAdmin->invoice_uuid);
});

test('creating an invoice while viewing All Outlets requires a valid outlet_id', function () {
    $admin = User::factory()->admin()->create();
    test()->actingAs($admin)->post(route('outlet-context.update'), ['outlet' => 'all'])->assertRedirect();

    $category = Category::create(['name' => 'Cat', 'slug' => 'cat-'.uniqid()]);
    $product = Product::create(['name' => 'Prod', 'category_id' => $category->id, 'price' => 100]);
    $client = Client::create(['name' => 'Client', 'phone' => '01700000000']);

    $response = test()->actingAs($admin)->post(route('invoices.store'), [
        'date' => now()->format('Y-m-d'),
        'client_id' => $client->id,
        'create_new_client' => false,
        'total' => 100,
        'paid' => 0,
        'due' => 100,
        'status' => 'In House',
        'discount_type' => 'Fixed',
        'discount_amount' => 0,
        'items' => [['productId' => $product->id, 'qty' => 1, 'price' => 100]],
    ]);

    $response->assertSessionHasErrors(['outlet_id']);
});

test('creating an invoice while viewing All Outlets with a valid outlet_id assigns the invoice to that outlet', function () {
    $outletB = Outlet::factory()->create();
    $admin = User::factory()->admin()->create();
    test()->actingAs($admin)->post(route('outlet-context.update'), ['outlet' => 'all'])->assertRedirect();

    $category = Category::create(['name' => 'Cat', 'slug' => 'cat-'.uniqid()]);
    $product = Product::create(['name' => 'Prod', 'category_id' => $category->id, 'price' => 100]);
    $client = Client::create(['name' => 'Client', 'phone' => '01700000000']);

    test()->actingAs($admin)->post(route('invoices.store'), [
        'date' => now()->format('Y-m-d'),
        'client_id' => $client->id,
        'create_new_client' => false,
        'outlet_id' => $outletB->id,
        'total' => 100,
        'paid' => 0,
        'due' => 100,
        'status' => 'In House',
        'discount_type' => 'Fixed',
        'discount_amount' => 0,
        'items' => [['productId' => $product->id, 'qty' => 1, 'price' => 100]],
    ])->assertSessionHasNoErrors();

    $invoice = Invoice::latest('id')->first();
    expect($invoice->outlet_id)->toBe($outletB->id);
});
