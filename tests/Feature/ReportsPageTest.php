<?php

use App\Models\Category;
use App\Models\Client;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Product;
use App\Models\User;

test('reports page loads and groups invoices by month without a database driver error', function () {
    $user = User::factory()->create();
    $category = Category::create(['name' => 'Gents Item', 'slug' => 'gents-item', 'description' => 'd']);
    $product = Product::create(['name' => 'P1', 'category_id' => $category->id, 'price' => 50]);
    $client = Client::create(['name' => 'Acme', 'phone' => '01700000000', 'type' => 'Consumer']);
    $invoice = Invoice::create([
        'invoice_uuid' => '0001',
        'date' => now()->format('Y-m-d'),
        'client_id' => $client->id,
        'total' => 50,
        'paid' => 50,
        'due' => 0,
        'status' => 'Delivered',
        'method' => 'Cash',
        'payment_status' => 'Paid',
    ]);
    InvoiceItem::create(['invoice_id' => $invoice->id, 'product_id' => $product->id, 'qty' => 1, 'price' => 50]);

    $response = $this->actingAs($user)->get(route('reports'));

    $response->assertOk();
});
