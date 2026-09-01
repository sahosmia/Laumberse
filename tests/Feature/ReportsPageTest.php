<?php

use App\Models\Category;
use App\Models\Client;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Outlet;
use App\Models\Product;
use App\Models\User;

test('reports page loads and groups invoices by month without a database driver error', function () {
    $user = User::factory()->admin()->create();
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

test('reports cost reflects real expenses for the month, not a percentage of revenue', function () {
    $user = User::factory()->admin()->create();
    $category = Category::create(['name' => 'Gents Item', 'slug' => 'gents-item', 'description' => 'd']);
    $product = Product::create(['name' => 'P1', 'category_id' => $category->id, 'price' => 100]);
    $client = Client::create(['name' => 'Acme', 'phone' => '01700000000', 'type' => 'Consumer']);
    $invoice = Invoice::create([
        'invoice_uuid' => 'INV-COST-1', 'date' => now()->format('Y-m-d'), 'client_id' => $client->id,
        'total' => 100, 'paid' => 100, 'due' => 0, 'status' => 'Delivered', 'method' => 'Cash', 'payment_status' => 'Paid',
    ]);
    InvoiceItem::create(['invoice_id' => $invoice->id, 'product_id' => $product->id, 'qty' => 1, 'price' => 100]);

    $expenseCategory = ExpenseCategory::create(['name' => 'Utilities', 'description' => 'd']);
    Expense::create([
        'expense_category_id' => $expenseCategory->id, 'amount' => 30, 'payment_method' => 'Cash', 'date' => now()->format('Y-m-d'),
    ]);

    $response = $this->actingAs($user)->get(route('reports'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('monthlyData.0.revenue', 100)
        ->where('monthlyData.0.cost', 30) // the real expense, not 100 * 0.4 = 40
    );
});

test('reports respects the outlet scope', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Manager');
    $userB = User::factory()->for($outletB, 'outlet')->create();
    $userB->assignRole('Manager');

    $category = Category::create(['name' => 'Gents Item', 'slug' => 'gents-item', 'description' => 'd']);
    $product = Product::create(['name' => 'P1', 'category_id' => $category->id, 'price' => 100]);
    $client = Client::create(['name' => 'Acme', 'phone' => '01700000000', 'type' => 'Consumer']);

    $invoiceA = Invoice::create([
        'outlet_id' => $userA->outlet_id, 'invoice_uuid' => 'INV-A', 'date' => now()->format('Y-m-d'), 'client_id' => $client->id,
        'total' => 100, 'paid' => 100, 'due' => 0, 'status' => 'Delivered', 'method' => 'Cash', 'payment_status' => 'Paid',
    ]);
    InvoiceItem::create(['invoice_id' => $invoiceA->id, 'product_id' => $product->id, 'qty' => 1, 'price' => 100]);

    $invoiceB = Invoice::create([
        'outlet_id' => $outletB->id, 'invoice_uuid' => 'INV-B', 'date' => now()->format('Y-m-d'), 'client_id' => $client->id,
        'total' => 500, 'paid' => 500, 'due' => 0, 'status' => 'Delivered', 'method' => 'Cash', 'payment_status' => 'Paid',
    ]);
    InvoiceItem::create(['invoice_id' => $invoiceB->id, 'product_id' => $product->id, 'qty' => 1, 'price' => 500]);

    $response = $this->actingAs($userA)->get(route('reports'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('monthlyData.0.revenue', 100)
        ->where('totalServices', 1)
    );
});

test('reports period=today excludes invoices from other days', function () {
    $user = User::factory()->create();
    $user->assignRole('Manager');
    $category = Category::create(['name' => 'Gents Item', 'slug' => 'gents-item', 'description' => 'd']);
    $product = Product::create(['name' => 'P1', 'category_id' => $category->id, 'price' => 100]);
    $client = Client::create(['name' => 'Acme', 'phone' => '01700000000', 'type' => 'Consumer']);

    $today = Invoice::create([
        'outlet_id' => $user->outlet_id, 'invoice_uuid' => 'INV-TODAY', 'date' => now()->format('Y-m-d'), 'client_id' => $client->id,
        'total' => 100, 'paid' => 100, 'due' => 0, 'status' => 'Delivered', 'method' => 'Cash', 'payment_status' => 'Paid',
    ]);
    InvoiceItem::create(['invoice_id' => $today->id, 'product_id' => $product->id, 'qty' => 1, 'price' => 100]);

    $yesterday = Invoice::create([
        'outlet_id' => $user->outlet_id, 'invoice_uuid' => 'INV-YESTERDAY', 'date' => now()->subDay()->format('Y-m-d'), 'client_id' => $client->id,
        'total' => 900, 'paid' => 900, 'due' => 0, 'status' => 'Delivered', 'method' => 'Cash', 'payment_status' => 'Paid',
    ]);
    InvoiceItem::create(['invoice_id' => $yesterday->id, 'product_id' => $product->id, 'qty' => 1, 'price' => 900]);

    $response = $this->actingAs($user)->get(route('reports', ['period' => 'today']));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('filters.period', 'today')
        ->where('totalServices', 1)
    );
});
