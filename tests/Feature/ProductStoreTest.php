<?php

use App\Actions\Products\CreateProductAction;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('product can be created with an image and the file is stored', function () {
    Storage::fake('public');
    $user = User::factory()->admin()->create();
    $category = Category::create(['name' => 'Gents Item', 'slug' => 'gents-item', 'description' => 'd']);
    $image = UploadedFile::fake()->image('product.jpg');

    $response = $this->actingAs($user)->post(route('products.store'), [
        'name' => 'Test Product',
        'category_id' => $category->id,
        'price' => 100,
        'image' => $image,
    ]);

    $response->assertSessionHasNoErrors();
    $product = Product::first();
    expect($product)->not->toBeNull();
    Storage::disk('public')->assertExists($product->image);
});

test('product image is replaced when a new image is uploaded on update', function () {
    Storage::fake('public');
    $user = User::factory()->admin()->create();
    $category = Category::create(['name' => 'Gents Item', 'slug' => 'gents-item', 'description' => 'd']);

    $this->actingAs($user)->post(route('products.store'), [
        'name' => 'Test Product',
        'category_id' => $category->id,
        'price' => 100,
        'image' => UploadedFile::fake()->image('old.jpg'),
    ]);
    $product = Product::first();
    $oldPath = $product->image;
    Storage::disk('public')->assertExists($oldPath);

    $this->actingAs($user)->put(route('products.update', $product), [
        'name' => 'Test Product',
        'category_id' => $category->id,
        'price' => 150,
        'image' => UploadedFile::fake()->image('new.jpg'),
    ]);

    $product->refresh();
    Storage::disk('public')->assertMissing($oldPath);
    Storage::disk('public')->assertExists($product->image);
});

test('a failed product creation cleans up the already-stored image and does not persist a row', function () {
    // Regression guard for the DB::transaction() conversion (P1.9): CreateProductAction stores the
    // uploaded file, then inserts the row inside a transaction. If the insert fails (here: the
    // unique name constraint, triggered by calling the Action directly so StoreProductRequest's
    // validation doesn't catch it first), the file it just stored must not be left orphaned, and
    // no product row should exist.
    Storage::fake('public');
    $category = Category::create(['name' => 'Gents Item', 'slug' => 'gents-item', 'description' => 'd']);
    Product::create(['name' => 'Duplicate Name', 'category_id' => $category->id, 'price' => 100]);

    $image = UploadedFile::fake()->image('product.jpg');
    $expectedPath = 'products/'.$image->hashName();

    expect(fn () => app(CreateProductAction::class)([
        'name' => 'Duplicate Name',
        'category_id' => $category->id,
        'price' => 200,
        'image' => $image,
    ]))->toThrow(\Illuminate\Database\QueryException::class);

    expect(Product::count())->toBe(1);
    Storage::disk('public')->assertMissing($expectedPath);
});

test('product image is deleted when the product is deleted', function () {
    Storage::fake('public');
    $user = User::factory()->admin()->create();
    $category = Category::create(['name' => 'Gents Item', 'slug' => 'gents-item', 'description' => 'd']);

    $this->actingAs($user)->post(route('products.store'), [
        'name' => 'Test Product',
        'category_id' => $category->id,
        'price' => 100,
        'image' => UploadedFile::fake()->image('product.jpg'),
    ]);
    $product = Product::first();
    $path = $product->image;
    Storage::disk('public')->assertExists($path);

    $this->actingAs($user)->delete(route('products.destroy', $product));

    Storage::disk('public')->assertMissing($path);
    $this->assertDatabaseMissing('products', ['id' => $product->id]);
});
