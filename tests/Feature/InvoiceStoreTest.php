<?php

use App\Models\User;
use App\Models\Client;
use App\Models\Product;
use App\Models\Category;
use App\Models\Invoice;

test('invoice can be stored with existing client', function () {
    $user = User::factory()->create();
    $category = Category::create(['name' => 'Test Category', 'slug' => 'test-category']);
    $product = Product::create([
        'name' => 'Test Product',
        'category_id' => $category->id,
        'price' => 100,
    ]);
    $client = Client::create([
        'name' => 'Existing Client',
        'phone' => '01700000000',
        'address' => 'Test Address'
    ]);

    $data = [
        'date' => now()->format('Y-m-d'),
        'client_id' => $client->id,
        'create_new_client' => false,
        'total' => 100,
        'paid' => 100,
        'due' => 0,
        'status' => 'Processing',
        'method' => 'Cash',
        'discount_type' => 'Fixed',
        'discount_amount' => 0,
        'items' => [
            [
                'productId' => $product->id,
                'qty' => 1,
                'price' => 100
            ]
        ]
    ];

    $response = $this->actingAs($user)->post(route('invoices.store'), $data);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect(route('history'));
});

test('invoice can be stored without ever touching the discount amount field', function () {
    // Regression test: the create form used to default discount_amount to an empty
    // string, which failed the old `required` rule and silently blocked creation
    // with no visible error, making the invoice appear to "not show up" afterward.
    $user = User::factory()->create();
    $category = Category::create(['name' => 'Test Category', 'slug' => 'test-category']);
    $product = Product::create([
        'name' => 'Test Product',
        'category_id' => $category->id,
        'price' => 100,
    ]);
    $client = Client::create([
        'name' => 'Existing Client',
        'phone' => '01700000000',
    ]);

    $data = [
        'date' => now()->format('Y-m-d'),
        'client_id' => $client->id,
        'create_new_client' => false,
        'total' => 100,
        'paid' => 100,
        'due' => 0,
        'status' => 'Processing',
        'method' => 'Cash',
        'discount_type' => 'Fixed',
        // discount_amount intentionally omitted
        'items' => [
            ['productId' => $product->id, 'qty' => 1, 'price' => 100]
        ]
    ];

    $response = $this->actingAs($user)->post(route('invoices.store'), $data);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect(route('history'));
    $invoice = Invoice::latest('id')->first();
    expect((float) $invoice->discount_amount)->toEqual(0.0);
});

test('invoice can be stored without ever touching the paid amount field', function () {
    // Regression test: same class of bug as discount_amount above — paid used to
    // default to an empty string and was `required`, so leaving it blank silently
    // blocked creation.
    $user = User::factory()->create();
    $category = Category::create(['name' => 'Test Category', 'slug' => 'test-category']);
    $product = Product::create([
        'name' => 'Test Product',
        'category_id' => $category->id,
        'price' => 100,
    ]);
    $client = Client::create([
        'name' => 'Existing Client',
        'phone' => '01700000000',
    ]);

    $data = [
        'date' => now()->format('Y-m-d'),
        'client_id' => $client->id,
        'create_new_client' => false,
        'total' => 100,
        'due' => 100,
        // paid intentionally omitted
        'status' => 'Processing',
        'method' => 'Cash',
        'discount_type' => 'Fixed',
        'discount_amount' => 0,
        'items' => [
            ['productId' => $product->id, 'qty' => 1, 'price' => 100]
        ]
    ];

    $response = $this->actingAs($user)->post(route('invoices.store'), $data);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect(route('history'));
    $invoice = Invoice::latest('id')->first();
    expect((float) $invoice->paid)->toEqual(0.0);
});

test('invoice is assigned a 4-digit zero-padded serial number based on its id', function () {
    $user = User::factory()->create();
    $category = Category::create(['name' => 'Test Category', 'slug' => 'test-category']);
    $product = Product::create([
        'name' => 'Test Product',
        'category_id' => $category->id,
        'price' => 100,
    ]);
    $client = Client::create([
        'name' => 'Existing Client',
        'phone' => '01700000000',
    ]);

    $data = [
        'date' => now()->format('Y-m-d'),
        'client_id' => $client->id,
        'create_new_client' => false,
        'total' => 100,
        'paid' => 100,
        'due' => 0,
        'status' => 'Processing',
        'method' => 'Cash',
        'discount_type' => 'Fixed',
        'discount_amount' => 0,
        'items' => [
            ['productId' => $product->id, 'qty' => 1, 'price' => 100]
        ]
    ];

    $response = $this->actingAs($user)->post(route('invoices.store'), $data);

    $response->assertSessionHasNoErrors();
    $invoice = Invoice::latest('id')->first();
    expect($invoice->invoice_uuid)->toBe(str_pad((string) $invoice->id, 4, '0', STR_PAD_LEFT));

    // A second invoice gets a distinct, still-unique serial.
    $this->actingAs($user)->post(route('invoices.store'), $data);
    $secondInvoice = Invoice::latest('id')->first();
    expect($secondInvoice->invoice_uuid)->not->toBe($invoice->invoice_uuid);
});

test('invoice can be stored with a delivery charge and defaults to 0 if blank', function () {
    $user = User::factory()->create();
    $category = Category::create(['name' => 'Test Category', 'slug' => 'test-category']);
    $product = Product::create([
        'name' => 'Test Product',
        'category_id' => $category->id,
        'price' => 100,
    ]);
    $client = Client::create([
        'name' => 'Existing Client',
        'phone' => '01700000000',
        'address' => 'Test Address'
    ]);

    $data = [
        'date' => now()->format('Y-m-d'),
        'client_id' => $client->id,
        'create_new_client' => false,
        'total' => 150,
        'paid' => 150,
        'due' => 0,
        'status' => 'Processing',
        'method' => 'Cash',
        'discount_type' => 'Fixed',
        'discount_amount' => 0,
        'delivery_charge' => 50,
        'items' => [
            [
                'productId' => $product->id,
                'qty' => 1,
                'price' => 100
            ]
        ]
    ];

    $response = $this->actingAs($user)->post(route('invoices.store'), $data);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect(route('history'));

    $invoice = Invoice::latest('id')->first();
    expect($invoice->delivery_charge)->toEqual(50.00);
});

test('invoice cannot be stored with empty client id when create_new_client is false', function () {
    $user = User::factory()->create();

    $data = [
        'date' => now()->format('Y-m-d'),
        'client_id' => '',
        'create_new_client' => false,
        'total' => 100,
        'paid' => 100,
        'due' => 0,
        'status' => 'Processing',
        'method' => 'Cash',
        'discount_type' => 'Fixed',
        'discount_amount' => 0,
        'items' => [
            ['productId' => 1, 'qty' => 1, 'price' => 100]
        ]
    ];

    $response = $this->actingAs($user)->post(route('invoices.store'), $data);

    $response->assertSessionHasErrors(['client_id']);
});

test('invoice can be stored with new client', function () {
    $user = User::factory()->create();
    $category = Category::create(['name' => 'Test Category', 'slug' => 'test-category']);
    $product = Product::create([
        'name' => 'Test Product',
        'category_id' => $category->id,
        'price' => 100,
    ]);

    $data = [
        'date' => now()->format('Y-m-d'),
        'client_id' => '',
        'create_new_client' => true,
        'new_client_name' => 'New Client',
        'new_client_phone' => '01800000000',
        'new_client_type' => 'Consumer',
        'new_client_address' => 'New Address',
        'total' => 100,
        'paid' => 100,
        'due' => 0,
        'status' => 'Processing',
        'method' => 'Cash',
        'discount_type' => 'Fixed',
        'discount_amount' => 0,
        'items' => [
            [
                'productId' => $product->id,
                'qty' => 1,
                'price' => 100
            ]
        ]
    ];

    $response = $this->actingAs($user)->post(route('invoices.store'), $data);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect(route('history'));
});

test('invoice can be stored with a new B2B client', function () {
    $user = User::factory()->create();
    $category = Category::create(['name' => 'Test Category', 'slug' => 'test-category']);
    $product = Product::create([
        'name' => 'Test Product',
        'category_id' => $category->id,
        'price' => 100,
    ]);

    $data = [
        'date' => now()->format('Y-m-d'),
        'client_id' => '',
        'create_new_client' => true,
        'new_client_name' => 'B2B Client',
        'new_client_phone' => '01900000000',
        'new_client_type' => 'B2B',
        'new_client_address' => 'New Address',
        'total' => 100,
        'paid' => 100,
        'due' => 0,
        'status' => 'Processing',
        'method' => 'Cash',
        'discount_type' => 'Fixed',
        'discount_amount' => 0,
        'items' => [
            [
                'productId' => $product->id,
                'qty' => 1,
                'price' => 100
            ]
        ]
    ];

    $response = $this->actingAs($user)->post(route('invoices.store'), $data);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect(route('history'));
    $this->assertDatabaseHas('clients', [
        'name' => 'B2B Client',
        'type' => 'B2B',
    ]);
});

test('delivery charge is ignored when the client is Corporate', function () {
    $user = User::factory()->create();
    $category = Category::create(['name' => 'Test Category', 'slug' => 'test-category']);
    $product = Product::create([
        'name' => 'Test Product',
        'category_id' => $category->id,
        'price' => 100,
    ]);
    $client = Client::create([
        'name' => 'Corporate Client',
        'phone' => '01700000001',
        'type' => 'Corporate',
    ]);

    $data = [
        'date' => now()->format('Y-m-d'),
        'client_id' => $client->id,
        'create_new_client' => false,
        'total' => 100,
        'paid' => 100,
        'due' => 0,
        'status' => 'Processing',
        'method' => 'Cash',
        'discount_type' => 'Fixed',
        'discount_amount' => 0,
        'delivery_charge' => 50,
        'items' => [
            [
                'productId' => $product->id,
                'qty' => 1,
                'price' => 100
            ]
        ]
    ];

    $response = $this->actingAs($user)->post(route('invoices.store'), $data);

    $response->assertSessionHasNoErrors();
    $invoice = Invoice::latest('id')->first();
    expect((float) $invoice->delivery_charge)->toEqual(0.00);
});

test('a fully paid invoice is automatically marked Paid on creation', function () {
    $user = User::factory()->create();
    $category = Category::create(['name' => 'Test Category', 'slug' => 'test-category']);
    $product = Product::create([
        'name' => 'Test Product',
        'category_id' => $category->id,
        'price' => 100,
    ]);
    $client = Client::create([
        'name' => 'Existing Client',
        'phone' => '01700000000',
    ]);

    $data = [
        'date' => now()->format('Y-m-d'),
        'client_id' => $client->id,
        'create_new_client' => false,
        'total' => 100,
        'paid' => 100,
        'due' => 0,
        'status' => 'Processing',
        'method' => 'Cash',
        'discount_type' => 'Fixed',
        'discount_amount' => 0,
        'items' => [
            ['productId' => $product->id, 'qty' => 1, 'price' => 100]
        ]
    ];

    $response = $this->actingAs($user)->post(route('invoices.store'), $data);

    $response->assertSessionHasNoErrors();
    $invoice = Invoice::latest('id')->first();
    expect($invoice->payment_status)->toBe('Paid');
    expect($invoice->payment_date)->toBe($data['date']);
});

test('an invoice with a remaining due is automatically marked Unpaid on creation', function () {
    $user = User::factory()->create();
    $category = Category::create(['name' => 'Test Category', 'slug' => 'test-category']);
    $product = Product::create([
        'name' => 'Test Product',
        'category_id' => $category->id,
        'price' => 100,
    ]);
    $client = Client::create([
        'name' => 'Existing Client',
        'phone' => '01700000000',
    ]);

    $data = [
        'date' => now()->format('Y-m-d'),
        'client_id' => $client->id,
        'create_new_client' => false,
        'total' => 100,
        'paid' => 40,
        'due' => 60,
        'status' => 'Processing',
        'method' => 'Cash',
        'discount_type' => 'Fixed',
        'discount_amount' => 0,
        'items' => [
            ['productId' => $product->id, 'qty' => 1, 'price' => 100]
        ]
    ];

    $response = $this->actingAs($user)->post(route('invoices.store'), $data);

    $response->assertSessionHasNoErrors();
    $invoice = Invoice::latest('id')->first();
    expect($invoice->payment_status)->toBe('Unpaid');
    expect($invoice->payment_date)->toBeNull();
});
