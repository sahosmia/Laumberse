<?php

use App\Models\Category;
use App\Models\Client;
use App\Models\Outlet;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('creating a corporate client syncs its custom prices', function () {
    $user = User::factory()->admin()->create();
    $category = Category::create(['name' => 'Gents Item', 'slug' => 'gents-item', 'description' => 'd']);
    $product = Product::create(['name' => 'P1', 'category_id' => $category->id, 'price' => 50]);

    $response = $this->actingAs($user)->post(route('clients.store'), [
        'name' => 'Acme Corp',
        'phone' => '01700000000',
        'type' => 'Corporate',
        'custom_prices' => [
            ['product_id' => $product->id, 'custom_price' => 40],
        ],
    ]);

    $response->assertSessionHasNoErrors();
    $client = Client::first();
    $this->assertDatabaseHas('customer_product_prices', [
        'customer_id' => $client->id,
        'product_id' => $product->id,
        'custom_price' => 40,
    ]);
});

test('creating a consumer client ignores any custom prices sent', function () {
    $user = User::factory()->admin()->create();
    $category = Category::create(['name' => 'Gents Item', 'slug' => 'gents-item', 'description' => 'd']);
    $product = Product::create(['name' => 'P1', 'category_id' => $category->id, 'price' => 50]);

    $response = $this->actingAs($user)->post(route('clients.store'), [
        'name' => 'Individual',
        'phone' => '01711111111',
        'type' => 'Consumer', 'outlet_id' => Outlet::first()->id,
        'custom_prices' => [
            ['product_id' => $product->id, 'custom_price' => 40],
        ],
    ]);

    $response->assertSessionHasNoErrors();
    $this->assertDatabaseCount('customer_product_prices', 0);
});

test('updating a corporate client replaces its custom prices', function () {
    $user = User::factory()->admin()->create();
    $category = Category::create(['name' => 'Gents Item', 'slug' => 'gents-item', 'description' => 'd']);
    $product1 = Product::create(['name' => 'P1', 'category_id' => $category->id, 'price' => 50]);
    $product2 = Product::create(['name' => 'P2', 'category_id' => $category->id, 'price' => 60]);

    $client = Client::create(['name' => 'Acme Corp', 'phone' => '01700000000', 'type' => 'Corporate']);
    $client->customPrices()->create(['product_id' => $product1->id, 'custom_price' => 10]);

    $response = $this->actingAs($user)->put(route('clients.update', $client), [
        'name' => 'Acme Corp',
        'phone' => '01700000000',
        'type' => 'Corporate',
        'custom_prices' => [
            ['product_id' => $product2->id, 'custom_price' => 20],
        ],
    ]);

    $response->assertSessionHasNoErrors();
    $this->assertDatabaseMissing('customer_product_prices', ['product_id' => $product1->id]);
    $this->assertDatabaseHas('customer_product_prices', ['product_id' => $product2->id, 'custom_price' => 20]);
});

test('updating a client away from corporate removes its custom prices', function () {
    $user = User::factory()->admin()->create();
    $category = Category::create(['name' => 'Gents Item', 'slug' => 'gents-item', 'description' => 'd']);
    $product = Product::create(['name' => 'P1', 'category_id' => $category->id, 'price' => 50]);

    $client = Client::create(['name' => 'Acme Corp', 'phone' => '01700000000', 'type' => 'Corporate']);
    $client->customPrices()->create(['product_id' => $product->id, 'custom_price' => 10]);

    $response = $this->actingAs($user)->put(route('clients.update', $client), [
        'name' => 'Acme Corp',
        'phone' => '01700000000',
        'type' => 'Consumer', 'outlet_id' => Outlet::first()->id,
    ]);

    $response->assertSessionHasNoErrors();
    $this->assertDatabaseCount('customer_product_prices', 0);
});

test('an admin can create a client with portal login credentials', function () {
    $user = User::factory()->admin()->create();

    $response = $this->actingAs($user)->post(route('clients.store'), [
        'name' => 'Acme Corp',
        'phone' => '01700000000',
        'type' => 'Consumer', 'outlet_id' => Outlet::first()->id,
        'username' => 'acme',
        'password' => 'secret123',
    ]);

    $response->assertSessionHasNoErrors();
    $client = Client::first();
    expect($client->username)->toBe('acme');
    expect(Hash::check('secret123', $client->password))->toBeTrue();
});

test('username must be unique across clients', function () {
    $user = User::factory()->admin()->create();
    Client::create(['name' => 'Existing', 'phone' => '01700000000', 'type' => 'Consumer', 'outlet_id' => Outlet::first()->id, 'username' => 'acme', 'password' => 'secret123']);

    $response = $this->actingAs($user)->post(route('clients.store'), [
        'name' => 'Acme Corp',
        'phone' => '01700000001',
        'type' => 'Consumer', 'outlet_id' => Outlet::first()->id,
        'username' => 'acme',
        'password' => 'secret456',
    ]);

    $response->assertSessionHasErrors('username');
});

test('a password is required when a username is given on create', function () {
    $user = User::factory()->admin()->create();

    $response = $this->actingAs($user)->post(route('clients.store'), [
        'name' => 'Acme Corp',
        'phone' => '01700000000',
        'type' => 'Consumer', 'outlet_id' => Outlet::first()->id,
        'username' => 'acme',
    ]);

    $response->assertSessionHasErrors('password');
});

test('a client without a username or password is created without portal access', function () {
    $user = User::factory()->admin()->create();

    $this->actingAs($user)->post(route('clients.store'), [
        'name' => 'Acme Corp',
        'phone' => '01700000000',
        'type' => 'Consumer', 'outlet_id' => Outlet::first()->id,
    ])->assertSessionHasNoErrors();

    $client = Client::first();
    expect($client->username)->toBeNull();
    expect($client->hasPortalAccess())->toBeFalse();
});

test('leaving the password blank on update keeps the client\'s existing password', function () {
    $user = User::factory()->admin()->create();
    $client = Client::create([
        'name' => 'Acme Corp', 'phone' => '01700000000', 'type' => 'Consumer', 'outlet_id' => Outlet::first()->id,
        'username' => 'acme', 'password' => 'original-password',
    ]);

    $response = $this->actingAs($user)->put(route('clients.update', $client), [
        'name' => 'Acme Corp Updated',
        'phone' => '01700000000',
        'type' => 'Consumer', 'outlet_id' => Outlet::first()->id,
        'username' => 'acme',
    ]);

    $response->assertSessionHasNoErrors();
    expect(Hash::check('original-password', $client->fresh()->password))->toBeTrue();
});

test('clearing the username on update revokes portal access', function () {
    $user = User::factory()->admin()->create();
    $client = Client::create([
        'name' => 'Acme Corp', 'phone' => '01700000000', 'type' => 'Consumer', 'outlet_id' => Outlet::first()->id,
        'username' => 'acme', 'password' => 'secret123',
    ]);

    $response = $this->actingAs($user)->put(route('clients.update', $client), [
        'name' => 'Acme Corp',
        'phone' => '01700000000',
        'type' => 'Consumer', 'outlet_id' => Outlet::first()->id,
        'username' => '',
    ]);

    $response->assertSessionHasNoErrors();
    expect($client->fresh()->hasPortalAccess())->toBeFalse();
});
