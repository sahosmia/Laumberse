<?php

use App\Models\User;
use App\Models\Product;
use App\Models\Category;
use Inertia\Testing\AssertableInertia as Assert;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('it can see products', function () {
    $user = User::factory()->create();
    $category = Category::create(['name' => 'Test', 'slug' => 'test']);

    Product::create(['name' => 'Product 1', 'category_id' => $category->id, 'price' => 10]);

    $response = $this->actingAs($user)->get('/products');

    if ($response->exception) {
        throw $response->exception;
    }

    $response->assertInertia(fn (Assert $page) => $page
        ->has('products.data', 1)
        ->where('products.data.0.name', 'Product 1')
    );
});
