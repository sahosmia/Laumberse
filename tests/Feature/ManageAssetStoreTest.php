<?php

use App\Models\AssetCategory;
use App\Models\ExpenseCategory;
use App\Models\ManageAsset;
use App\Models\User;

test('a new-purchase asset creates an expense record', function () {
    $user = User::factory()->create();
    $assetCategory = AssetCategory::create(['name' => 'Machinery', 'description' => 'd']);

    $response = $this->actingAs($user)->post(route('manage-assets.store'), [
        'name' => 'New Machine',
        'description' => 'desc',
        'purchase_date' => now()->format('Y-m-d'),
        'cost' => 5000,
        'status' => 'Active',
        'asset_category_id' => $assetCategory->id,
        'is_new_purchase' => true,
        'payment_method' => 'Cash',
    ]);

    $response->assertSessionHasNoErrors();
    $asset = ManageAsset::first();
    $this->assertDatabaseHas('expenses', [
        'manage_asset_id' => $asset->id,
        'amount' => 5000,
        'payment_method' => 'Cash',
    ]);
    $this->assertDatabaseHas('expense_categories', ['name' => 'Asset Purchase']);
});

test('an existing (non-new-purchase) asset does not create an expense record', function () {
    $user = User::factory()->create();
    $assetCategory = AssetCategory::create(['name' => 'Machinery', 'description' => 'd']);

    $response = $this->actingAs($user)->post(route('manage-assets.store'), [
        'name' => 'Existing Machine',
        'description' => 'desc',
        'purchase_date' => now()->format('Y-m-d'),
        'cost' => 3000,
        'status' => 'Active',
        'asset_category_id' => $assetCategory->id,
    ]);

    $response->assertSessionHasNoErrors();
    $asset = ManageAsset::where('name', 'Existing Machine')->first();
    $this->assertDatabaseMissing('expenses', ['manage_asset_id' => $asset->id]);
});

test('a second new-purchase asset reuses the existing Asset Purchase expense category', function () {
    $user = User::factory()->create();
    $assetCategory = AssetCategory::create(['name' => 'Machinery', 'description' => 'd']);

    $payload = [
        'description' => 'desc',
        'purchase_date' => now()->format('Y-m-d'),
        'cost' => 1000,
        'status' => 'Active',
        'asset_category_id' => $assetCategory->id,
        'is_new_purchase' => true,
        'payment_method' => 'Cash',
    ];

    $this->actingAs($user)->post(route('manage-assets.store'), ['name' => 'Machine A'] + $payload);
    $this->actingAs($user)->post(route('manage-assets.store'), ['name' => 'Machine B'] + $payload);

    expect(ExpenseCategory::where('name', 'Asset Purchase')->count())->toBe(1);
});
