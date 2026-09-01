<?php

use App\Models\Category;
use App\Models\Client;
use App\Models\Product;

test('a client only sees their own custom prices in the portal', function () {
    $category = Category::create(['name' => 'Gents Item', 'slug' => 'gents-item', 'description' => 'd']);
    $product = Product::create(['name' => 'P1', 'category_id' => $category->id, 'price' => 100]);

    $clientA = Client::create([
        'name' => 'Client A', 'phone' => '01700000000', 'type' => 'Corporate',
        'username' => 'client-a', 'password' => 'secret123',
    ]);
    $clientB = Client::create([
        'name' => 'Client B', 'phone' => '01700000001', 'type' => 'Corporate',
        'username' => 'client-b', 'password' => 'secret123',
    ]);

    $clientA->customPrices()->create(['product_id' => $product->id, 'custom_price' => 80]);
    $clientB->customPrices()->create(['product_id' => $product->id, 'custom_price' => 90]);

    $response = $this->actingAs($clientA, 'client')->get(route('portal.prices.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('portal/prices/index')
        ->has('prices.data', 1)
        ->where('prices.data.0.product_id', $product->id)
    );
    expect((float) $response->viewData('page')['props']['prices']['data'][0]['custom_price'])->toBe(80.0);
});
