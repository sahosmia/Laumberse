<?php

use App\Models\Category;
use App\Models\Client;
use App\Models\Product;
use App\Models\User;

test('creating a corporate client syncs its custom prices', function () {
    $user = User::factory()->create();
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
    $user = User::factory()->create();
    $category = Category::create(['name' => 'Gents Item', 'slug' => 'gents-item', 'description' => 'd']);
    $product = Product::create(['name' => 'P1', 'category_id' => $category->id, 'price' => 50]);

    $response = $this->actingAs($user)->post(route('clients.store'), [
        'name' => 'Individual',
        'phone' => '01711111111',
        'type' => 'Consumer',
        'custom_prices' => [
            ['product_id' => $product->id, 'custom_price' => 40],
        ],
    ]);

    $response->assertSessionHasNoErrors();
    $this->assertDatabaseCount('customer_product_prices', 0);
});

test('updating a corporate client replaces its custom prices', function () {
    $user = User::factory()->create();
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
    $user = User::factory()->create();
    $category = Category::create(['name' => 'Gents Item', 'slug' => 'gents-item', 'description' => 'd']);
    $product = Product::create(['name' => 'P1', 'category_id' => $category->id, 'price' => 50]);

    $client = Client::create(['name' => 'Acme Corp', 'phone' => '01700000000', 'type' => 'Corporate']);
    $client->customPrices()->create(['product_id' => $product->id, 'custom_price' => 10]);

    $response = $this->actingAs($user)->put(route('clients.update', $client), [
        'name' => 'Acme Corp',
        'phone' => '01700000000',
        'type' => 'Consumer',
    ]);

    $response->assertSessionHasNoErrors();
    $this->assertDatabaseCount('customer_product_prices', 0);
});
