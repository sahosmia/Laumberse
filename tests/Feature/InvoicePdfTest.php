<?php

use App\Models\Account;
use App\Models\Category;
use App\Models\Client;
use App\Models\Invoice;
use App\Models\Product;
use App\Models\User;

// Exercises PrepareInvoicePdfDataAction end-to-end (discount, delivery charge, Bangla text via the
// @bn directive, remarks) — the PDF view itself has zero test coverage otherwise.
test('an invoice PDF can be generated with a discount, delivery charge, and Bangla text', function () {
    $user = User::factory()->admin()->create();
    $category = Category::create(['name' => 'Cat-'.uniqid(), 'slug' => 'cat-'.uniqid()]);
    $product = Product::create(['name' => 'পণ্য', 'category_id' => $category->id, 'price' => 100]);
    $client = Client::create(['name' => 'গ্রাহক', 'phone' => '01700000000', 'type' => 'Consumer']);
    $account = Account::create(['outlet_id' => $user->outlet_id, 'name' => 'Cash', 'opening_balance' => 0, 'current_balance' => 0]);

    test()->actingAs($user)->post(route('invoices.store'), [
        'date' => now()->format('Y-m-d'),
        'client_id' => $client->id,
        'create_new_client' => false,
        'total' => 180,
        'paid' => 100,
        'due' => 80,
        'status' => 'Processing',
        'method' => 'Cash',
        'account_id' => $account->id,
        'discount_type' => 'Percentage',
        'discount_amount' => 10,
        'delivery_charge' => 20,
        'remarks' => 'দ্রুত ডেলিভারি প্রয়োজন',
        'items' => [['productId' => $product->id, 'qty' => 2, 'price' => 100]],
    ])->assertSessionHasNoErrors();

    $invoice = Invoice::latest('id')->first();

    $response = test()->actingAs($user)->get(route('invoices.print', $invoice));

    $response->assertOk();
    expect($response->headers->get('content-type'))->toContain('application/pdf');
});

test('an invoice PDF can be generated with no discount and no remarks', function () {
    $user = User::factory()->admin()->create();
    $category = Category::create(['name' => 'Cat-'.uniqid(), 'slug' => 'cat-'.uniqid()]);
    $product = Product::create(['name' => 'Plain Product', 'category_id' => $category->id, 'price' => 50]);
    $client = Client::create(['name' => 'Plain Client', 'phone' => '01700000001', 'type' => 'Corporate']);
    $account = Account::create(['outlet_id' => $user->outlet_id, 'name' => 'Cash', 'opening_balance' => 0, 'current_balance' => 0]);

    test()->actingAs($user)->post(route('invoices.store'), [
        'date' => now()->format('Y-m-d'),
        'client_id' => $client->id,
        'create_new_client' => false,
        'total' => 50,
        'paid' => 50,
        'due' => 0,
        'status' => 'Delivered',
        'method' => 'Cash',
        'account_id' => $account->id,
        'discount_type' => 'Fixed',
        'discount_amount' => 0,
        'items' => [['productId' => $product->id, 'qty' => 1, 'price' => 50]],
    ])->assertSessionHasNoErrors();

    $invoice = Invoice::latest('id')->first();

    test()->actingAs($user)->get(route('invoices.print', $invoice))->assertOk();
});
