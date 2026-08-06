<?php

use App\Models\User;
use App\Models\Invoice;
use App\Models\Client;
use App\Models\Product;
use App\Models\Category;
use App\Models\Unit;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->category = Category::create(['name' => 'Services', 'slug' => 'services']);
    $this->unit = Unit::create(['name' => 'pcs', 'short_name' => 'pcs']);
    $this->product = Product::create([
        'name' => 'Test Product',
        'price' => 100,
        'category_id' => $this->category->id,
        'unit_id' => $this->unit->id,
    ]);
    $this->client = Client::create(['name' => 'John Doe', 'phone' => '123456789']);
});

test('invoice can be updated successfully with its serial-wise invoice_uuid', function () {
    $invoice = Invoice::create([
        'date' => now()->toDateString(),
        'client_id' => $this->client->id,
        'total' => 100,
        'paid' => 100,
        'due' => 0,
        'status' => 'Processing',
        'method' => 'Cash',
    ]);

    // Its invoice_uuid is automatically set to "0001" (or padded ID)
    $expectedUuid = str_pad($invoice->id, 4, '0', STR_PAD_LEFT);

    $response = $this->actingAs($this->user)->put(route('invoices.update', $invoice->id), [
        'invoice_uuid' => $expectedUuid,
        'date' => now()->toDateString(),
        'client_id' => $this->client->id,
        'total' => 200,
        'paid' => 150,
        'due' => 50,
        'status' => 'Delivered',
        'method' => 'Bank',
        'discount_type' => 'Fixed',
        'discount_amount' => 0,
        'items' => [
            ['productId' => $this->product->id, 'qty' => 2, 'price' => 100]
        ]
    ]);

    $response->assertRedirect(route('history'));
    $this->assertDatabaseHas('invoices', [
        'id' => $invoice->id,
        'invoice_uuid' => $expectedUuid,
        'total' => 200,
        'status' => 'Delivered',
    ]);
});

test('update fails if the modified invoice_uuid conflicts with another invoice', function () {
    $invoice1 = Invoice::create([
        'date' => now()->toDateString(),
        'client_id' => $this->client->id,
        'total' => 100,
        'paid' => 100,
        'due' => 0,
        'status' => 'Processing',
        'method' => 'Cash',
    ]);

    $invoice2 = Invoice::create([
        'date' => now()->toDateString(),
        'client_id' => $this->client->id,
        'total' => 100,
        'paid' => 100,
        'due' => 0,
        'status' => 'Processing',
        'method' => 'Cash',
    ]);

    $expectedUuid1 = str_pad($invoice1->id, 4, '0', STR_PAD_LEFT);

    // Try to update invoice2's uuid to match invoice1's uuid
    $response = $this->actingAs($this->user)->put(route('invoices.update', $invoice2->id), [
        'invoice_uuid' => $expectedUuid1,
        'date' => now()->toDateString(),
        'client_id' => $this->client->id,
        'total' => 200,
        'paid' => 200,
        'due' => 0,
        'status' => 'Processing',
        'method' => 'Cash',
        'discount_type' => 'Fixed',
        'discount_amount' => 0,
        'items' => [
            ['productId' => $this->product->id, 'qty' => 2, 'price' => 100]
        ]
    ]);

    $response->assertSessionHasErrors(['invoice_uuid']);
});
