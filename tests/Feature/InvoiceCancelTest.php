<?php

use App\Models\Account;
use App\Models\Category;
use App\Models\Client;
use App\Models\Invoice;
use App\Models\Product;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->admin()->create();
    $this->client = Client::create(['name' => 'John Doe', 'phone' => '123456789']);
    $this->account = Account::create(['outlet_id' => $this->user->outlet_id, 'name' => 'Cash', 'opening_balance' => 1000, 'current_balance' => 1000]);
});

test('cancelling a paid invoice reverses its payment back out of the account and voids the order', function () {
    $category = Category::create(['name' => 'Cat-'.uniqid(), 'slug' => 'cat-'.uniqid()]);
    $product = Product::create(['name' => 'Shirt', 'category_id' => $category->id, 'price' => 300]);

    $this->actingAs($this->user)->post(route('invoices.store'), [
        'date' => now()->format('Y-m-d'),
        'client_id' => $this->client->id,
        'create_new_client' => false,
        'total' => 300,
        'paid' => 300,
        'due' => 0,
        'status' => 'In House',
        'method' => 'Cash',
        'account_id' => $this->account->id,
        'discount_type' => 'Fixed',
        'discount_amount' => 0,
        'items' => [['productId' => $product->id, 'qty' => 1, 'price' => 300]],
    ])->assertSessionHasNoErrors();

    $invoice = Invoice::latest('id')->first();
    $this->client->refresh();
    expect((float) $this->client->total_paid)->toEqual(300.0);
    expect((int) $this->account->fresh()->current_balance)->toEqual(1300);

    $response = $this->actingAs($this->user)->patch(route('invoices.cancel', $invoice->id));

    $response->assertRedirect();
    $invoice->refresh();
    expect($invoice->status->value)->toBe('Bad Order');
    expect($invoice->payment_status->value)->toBe('Cancelled');
    expect((float) $invoice->paid)->toEqual(0.0);
    expect((float) $invoice->due)->toEqual(0.0);
    expect($invoice->payment_date)->toBeNull();

    // The 300 credited to the account on payment is reversed back out on cancel.
    expect((int) $this->account->fresh()->current_balance)->toEqual(1000);

    $this->client->refresh();
    expect((int) $this->client->total_orders)->toEqual(0);
    expect((float) $this->client->total_paid)->toEqual(0.0);
    expect((float) $this->client->total_due)->toEqual(0.0);
});

test('cancelling an unpaid invoice leaves the account balance untouched', function () {
    $invoice = Invoice::create([
        'invoice_uuid' => 'INV-CANCEL-UNPAID',
        'date' => now()->toDateString(),
        'client_id' => $this->client->id,
        'total' => 500,
        'paid' => 0,
        'due' => 500,
        'status' => 'In House',
        'method' => '',
        'payment_status' => 'Unpaid',
    ]);

    $response = $this->actingAs($this->user)->patch(route('invoices.cancel', $invoice->id));

    $response->assertRedirect();
    $invoice->refresh();
    expect($invoice->status->value)->toBe('Bad Order');
    expect($invoice->payment_status->value)->toBe('Cancelled');
    expect((float) $invoice->paid)->toEqual(0.0);
    expect((float) $invoice->due)->toEqual(0.0);
    expect((int) $this->account->fresh()->current_balance)->toEqual(1000);
});

test('an already-cancelled invoice cannot be cancelled again', function () {
    $invoice = Invoice::create([
        'invoice_uuid' => 'INV-ALREADY-BAD',
        'date' => now()->toDateString(),
        'client_id' => $this->client->id,
        'total' => 500,
        'paid' => 0,
        'due' => 0,
        'status' => 'Bad Order',
        'method' => '',
        'payment_status' => 'Cancelled',
    ]);

    $response = $this->actingAs($this->user)->patch(route('invoices.cancel', $invoice->id));

    $response->assertSessionHasErrors(['status']);
});

test('status cannot be set directly to Bad Order through the normal status-update endpoint', function () {
    $invoice = Invoice::create([
        'invoice_uuid' => 'INV-NO-DIRECT-BAD-ORDER',
        'date' => now()->toDateString(),
        'client_id' => $this->client->id,
        'total' => 100,
        'paid' => 100,
        'due' => 0,
        'status' => 'In House',
        'method' => 'Cash',
    ]);

    $response = $this->actingAs($this->user)->patch(route('invoices.update-status', $invoice->id), [
        'status' => 'Bad Order',
    ]);

    $response->assertSessionHasErrors(['status']);
    expect($invoice->fresh()->status->value)->toBe('In House');
});

test('an already-Bad-Order invoice cannot be moved back into the pipeline', function () {
    $invoice = Invoice::create([
        'invoice_uuid' => 'INV-LOCKED-STATUS',
        'date' => now()->toDateString(),
        'client_id' => $this->client->id,
        'total' => 100,
        'paid' => 0,
        'due' => 0,
        'status' => 'Bad Order',
        'method' => '',
        'payment_status' => 'Cancelled',
    ]);

    $response = $this->actingAs($this->user)->patch(route('invoices.update-status', $invoice->id), [
        'status' => 'Washing',
    ]);

    $response->assertSessionHasErrors(['status']);
});

test('payment status cannot be set directly to Cancelled through the normal payment-status-toggle endpoint', function () {
    $invoice = Invoice::create([
        'invoice_uuid' => 'INV-NO-DIRECT-CANCEL',
        'date' => now()->toDateString(),
        'client_id' => $this->client->id,
        'account_id' => $this->account->id,
        'total' => 100,
        'paid' => 100,
        'due' => 0,
        'status' => 'In House',
        'method' => 'Cash',
        'payment_status' => 'Paid',
    ]);

    $response = $this->actingAs($this->user)->patch(route('invoices.update-payment-status', $invoice->id), [
        'payment_status' => 'Cancelled',
    ]);

    $response->assertSessionHasErrors(['payment_status']);
});

test('a cancelled invoice cannot have its payment status toggled', function () {
    $invoice = Invoice::create([
        'invoice_uuid' => 'INV-LOCKED-PAYMENT',
        'date' => now()->toDateString(),
        'client_id' => $this->client->id,
        'total' => 100,
        'paid' => 0,
        'due' => 0,
        'status' => 'Bad Order',
        'method' => '',
        'payment_status' => 'Cancelled',
    ]);

    $response = $this->actingAs($this->user)->patch(route('invoices.update-payment-status', $invoice->id), [
        'payment_status' => 'Unpaid',
    ]);

    $response->assertSessionHasErrors(['payment_status']);
});
