<?php

use App\Models\Account;
use App\Models\Category;
use App\Models\Client;
use App\Models\Invoice;
use App\Models\Product;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->admin()->create();
    $this->category = Category::create(['name' => 'Services', 'slug' => 'services']);
    $this->product = Product::create([
        'name' => 'Test Product',
        'price' => 100,
        'category_id' => $this->category->id,
    ]);
    $this->client = Client::create(['name' => 'John Doe', 'phone' => '123456789']);
    $this->account = Account::create(['name' => 'Cash', 'opening_balance' => 0, 'current_balance' => 0]);
});

test('invoice can be updated successfully', function () {
    $invoice = Invoice::create([
        'invoice_uuid' => '0001',
        'date' => now()->toDateString(),
        'client_id' => $this->client->id,
        'total' => 100,
        'paid' => 100,
        'due' => 0,
        'status' => 'In House',
        'method' => 'Cash',
    ]);

    $response = $this->actingAs($this->user)->put(route('invoices.update', $invoice->id), [
        'date' => now()->toDateString(),
        'client_id' => $this->client->id,
        'total' => 200,
        'paid' => 150,
        'due' => 50,
        'status' => 'Delivered',
        'method' => 'Bank',
        'account_id' => $this->account->id,
        'discount_type' => 'Fixed',
        'discount_amount' => 0,
        'items' => [
            ['productId' => $this->product->id, 'qty' => 2, 'price' => 100],
        ],
    ]);

    $response->assertRedirect(route('history'));
    $this->assertDatabaseHas('invoices', [
        'id' => $invoice->id,
        'total' => 200,
        'status' => 'Delivered',
    ]);
});

test('invoice_uuid stays the same and is not editable through an update', function () {
    $invoice = Invoice::create([
        'invoice_uuid' => '0001',
        'date' => now()->toDateString(),
        'client_id' => $this->client->id,
        'total' => 100,
        'paid' => 100,
        'due' => 0,
        'status' => 'In House',
        'method' => 'Cash',
    ]);

    $response = $this->actingAs($this->user)->put(route('invoices.update', $invoice->id), [
        'invoice_uuid' => 'SOMETHING-ELSE',
        'date' => now()->toDateString(),
        'client_id' => $this->client->id,
        'total' => 200,
        'paid' => 200,
        'due' => 0,
        'status' => 'In House',
        'method' => 'Cash',
        'account_id' => $this->account->id,
        'discount_type' => 'Fixed',
        'discount_amount' => 0,
        'items' => [
            ['productId' => $this->product->id, 'qty' => 2, 'price' => 100],
        ],
    ]);

    $response->assertRedirect(route('history'));
    $this->assertDatabaseHas('invoices', [
        'id' => $invoice->id,
        'invoice_uuid' => '0001',
    ]);
});

test('editing an invoice to be fully paid updates its payment status', function () {
    // Regression test: updateInvoice used to leave payment_status untouched, so an
    // edit that fully settled the balance (paid == total) kept showing "Unpaid".
    $invoice = Invoice::create([
        'invoice_uuid' => '0002',
        'date' => now()->toDateString(),
        'client_id' => $this->client->id,
        'total' => 500,
        'paid' => 200,
        'due' => 300,
        'status' => 'In House',
        'method' => 'Cash',
        'payment_status' => 'Unpaid',
    ]);

    $response = $this->actingAs($this->user)->put(route('invoices.update', $invoice->id), [
        'date' => now()->toDateString(),
        'client_id' => $this->client->id,
        'total' => 1000,
        'paid' => 1000,
        'due' => 0,
        'status' => 'In House',
        'method' => 'Cash',
        'account_id' => $this->account->id,
        'discount_type' => 'Fixed',
        'discount_amount' => 0,
        'items' => [
            ['productId' => $this->product->id, 'qty' => 10, 'price' => 100],
        ],
    ]);

    $response->assertRedirect(route('history'));
    $invoice->refresh();
    expect($invoice->payment_status->value)->toBe('Paid');
    expect($invoice->payment_date)->toBe(now()->toDateString());
});

test('editing a paid invoice back to having a balance reverts its payment status', function () {
    $invoice = Invoice::create([
        'invoice_uuid' => '0003',
        'date' => now()->toDateString(),
        'client_id' => $this->client->id,
        'total' => 500,
        'paid' => 500,
        'due' => 0,
        'status' => 'In House',
        'method' => 'Cash',
        'payment_status' => 'Paid',
        'payment_date' => now()->toDateString(),
    ]);

    $response = $this->actingAs($this->user)->put(route('invoices.update', $invoice->id), [
        'date' => now()->toDateString(),
        'client_id' => $this->client->id,
        'total' => 1000,
        'paid' => 500,
        'due' => 500,
        'status' => 'In House',
        'method' => 'Cash',
        'account_id' => $this->account->id,
        'discount_type' => 'Fixed',
        'discount_amount' => 0,
        'items' => [
            ['productId' => $this->product->id, 'qty' => 10, 'price' => 100],
        ],
    ]);

    $response->assertRedirect(route('history'));
    $invoice->refresh();
    expect($invoice->payment_status->value)->toBe('Unpaid');
    expect($invoice->payment_date)->toBeNull();
});

test('editing an already-paid invoice preserves its original payment date', function () {
    $invoice = Invoice::create([
        'invoice_uuid' => '0004',
        'date' => now()->toDateString(),
        'client_id' => $this->client->id,
        'total' => 500,
        'paid' => 500,
        'due' => 0,
        'status' => 'In House',
        'method' => 'Cash',
        'payment_status' => 'Paid',
        'payment_date' => '2026-01-01',
    ]);

    $response = $this->actingAs($this->user)->put(route('invoices.update', $invoice->id), [
        'date' => now()->toDateString(),
        'client_id' => $this->client->id,
        'total' => 500,
        'paid' => 500,
        'due' => 0,
        'status' => 'Delivered',
        'method' => 'Cash',
        'account_id' => $this->account->id,
        'discount_type' => 'Fixed',
        'discount_amount' => 0,
        'items' => [
            ['productId' => $this->product->id, 'qty' => 5, 'price' => 100],
        ],
    ]);

    $response->assertRedirect(route('history'));
    $invoice->refresh();
    expect($invoice->payment_status->value)->toBe('Paid');
    expect($invoice->payment_date)->toBe('2026-01-01');
});
