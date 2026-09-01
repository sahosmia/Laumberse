<?php

use App\Models\Category;
use App\Models\Outlet;
use App\Models\OutletProductPrice;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\QueryException;

test('a product can be created with an outlet-specific price', function () {
    $user = User::factory()->admin()->create();
    $category = Category::create(['name' => 'Gents Item', 'slug' => 'gents-item', 'description' => 'd']);
    $outlet = Outlet::first();

    $response = $this->actingAs($user)->post(route('products.store'), [
        'name' => 'Test Product',
        'category_id' => $category->id,
        'price' => 100,
        'outlet_prices' => [
            ['outlet_id' => $outlet->id, 'price' => 85],
        ],
    ]);

    $response->assertSessionHasNoErrors();
    $product = Product::first();
    expect($product->outletPrices)->toHaveCount(1);
    expect((float) $product->outletPrices->first()->price)->toBe(85.0);
    expect($product->outletPrices->first()->outlet_id)->toBe($outlet->id);
});

test('updating a product replaces its outlet prices (delete-then-recreate)', function () {
    $user = User::factory()->admin()->create();
    $category = Category::create(['name' => 'Gents Item', 'slug' => 'gents-item', 'description' => 'd']);
    $outletA = Outlet::first();
    $outletB = Outlet::factory()->create();
    $product = Product::create(['name' => 'Test Product', 'category_id' => $category->id, 'price' => 100]);
    OutletProductPrice::create(['outlet_id' => $outletA->id, 'product_id' => $product->id, 'price' => 85]);

    $response = $this->actingAs($user)->put(route('products.update', $product), [
        'name' => 'Test Product',
        'category_id' => $category->id,
        'price' => 100,
        'outlet_prices' => [
            ['outlet_id' => $outletB->id, 'price' => 120],
        ],
    ]);

    $response->assertSessionHasNoErrors();
    $product->refresh();
    expect($product->outletPrices)->toHaveCount(1);
    expect($product->outletPrices->first()->outlet_id)->toBe($outletB->id);
    expect((float) $product->outletPrices->first()->price)->toBe(120.0);
});

test('the same outlet cannot have two prices for one product', function () {
    $outlet = Outlet::first();
    $category = Category::create(['name' => 'Gents Item', 'slug' => 'gents-item', 'description' => 'd']);
    $product = Product::create(['name' => 'Test Product', 'category_id' => $category->id, 'price' => 100]);
    OutletProductPrice::create(['outlet_id' => $outlet->id, 'product_id' => $product->id, 'price' => 85]);

    expect(fn () => OutletProductPrice::create(['outlet_id' => $outlet->id, 'product_id' => $product->id, 'price' => 90]))
        ->toThrow(QueryException::class);
});

test('the invoice create page includes each product\'s outlet prices', function () {
    $user = User::factory()->create();
    $user->assignRole('Manager');
    $category = Category::create(['name' => 'Gents Item', 'slug' => 'gents-item', 'description' => 'd']);
    $product = Product::create(['name' => 'Test Product', 'category_id' => $category->id, 'price' => 100]);
    OutletProductPrice::create(['outlet_id' => $user->outlet_id, 'product_id' => $product->id, 'price' => 80]);

    $response = $this->actingAs($user)->get(route('create-invoice'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('products.0.outlet_prices.0.price', 80)
    );
});
