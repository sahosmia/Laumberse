<?php

use App\Models\AssetCategory;
use App\Models\Category;
use App\Models\ExpenseCategory;
use App\Models\Material;
use App\Models\Product;
use App\Models\User;

test('expense category name must be unique on store', function () {
    $user = User::factory()->create();
    ExpenseCategory::create(['name' => 'Utilities', 'description' => 'x']);

    $response = $this->actingAs($user)->post(route('expense-categories.store'), [
        'name' => 'Utilities',
        'description' => 'y',
    ]);

    $response->assertSessionHasErrors(['name']);
});

test('expense category can be updated without changing its own name', function () {
    $user = User::factory()->create();
    $category = ExpenseCategory::create(['name' => 'Utilities', 'description' => 'x']);

    $response = $this->actingAs($user)->put(route('expense-categories.update', $category->id), [
        'name' => 'Utilities',
        'description' => 'updated description',
    ]);

    $response->assertSessionHasNoErrors();
});

test('expense category cannot be updated to another category\'s name', function () {
    $user = User::factory()->create();
    ExpenseCategory::create(['name' => 'Utilities', 'description' => 'x']);
    $category = ExpenseCategory::create(['name' => 'Rent', 'description' => 'x']);

    $response = $this->actingAs($user)->put(route('expense-categories.update', $category->id), [
        'name' => 'Utilities',
        'description' => 'x',
    ]);

    $response->assertSessionHasErrors(['name']);
});

test('asset category name must be unique on store', function () {
    $user = User::factory()->create();
    AssetCategory::create(['name' => 'Machinery', 'description' => 'x']);

    $response = $this->actingAs($user)->post(route('asset-categories.store'), [
        'name' => 'Machinery',
        'description' => 'y',
    ]);

    $response->assertSessionHasErrors(['name']);
});

test('asset category can be updated without changing its own name', function () {
    $user = User::factory()->create();
    $category = AssetCategory::create(['name' => 'Machinery', 'description' => 'x']);

    $response = $this->actingAs($user)->put(route('asset-categories.update', $category->id), [
        'name' => 'Machinery',
        'description' => 'updated description',
    ]);

    $response->assertSessionHasNoErrors();
});

test('material name must be unique on store', function () {
    $user = User::factory()->create();
    Material::create(['name' => 'Fabric A']);

    $response = $this->actingAs($user)->post(route('materials.store'), [
        'name' => 'Fabric A',
    ]);

    $response->assertSessionHasErrors(['name']);
});

test('material can be updated without changing its own name', function () {
    $user = User::factory()->create();
    $material = Material::create(['name' => 'Fabric A']);

    $response = $this->actingAs($user)->put(route('materials.update', $material->id), [
        'name' => 'Fabric A',
    ]);

    $response->assertSessionHasNoErrors();
});

test('product name must be unique on store', function () {
    $user = User::factory()->create();
    $category = Category::create(['name' => 'Gents Item', 'slug' => 'gents-item']);
    Product::create(['name' => 'Shirt', 'category_id' => $category->id, 'price' => 15]);

    $response = $this->actingAs($user)->post(route('products.store'), [
        'name' => 'Shirt',
        'category_id' => $category->id,
        'price' => 20,
    ]);

    $response->assertSessionHasErrors(['name']);
});

test('product can be updated without changing its own name', function () {
    $user = User::factory()->create();
    $category = Category::create(['name' => 'Gents Item', 'slug' => 'gents-item']);
    $product = Product::create(['name' => 'Shirt', 'category_id' => $category->id, 'price' => 15]);

    $response = $this->actingAs($user)->put(route('products.update', $product), [
        'name' => 'Shirt',
        'category_id' => $category->id,
        'price' => 20,
    ]);

    $response->assertSessionHasNoErrors();
});

test('product cannot be updated to another product\'s name', function () {
    $user = User::factory()->create();
    $category = Category::create(['name' => 'Gents Item', 'slug' => 'gents-item']);
    Product::create(['name' => 'Shirt', 'category_id' => $category->id, 'price' => 15]);
    $product = Product::create(['name' => 'T-Shirt', 'category_id' => $category->id, 'price' => 15]);

    $response = $this->actingAs($user)->put(route('products.update', $product), [
        'name' => 'Shirt',
        'category_id' => $category->id,
        'price' => 15,
    ]);

    $response->assertSessionHasErrors(['name']);
});
