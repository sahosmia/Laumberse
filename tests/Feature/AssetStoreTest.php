<?php

use App\Models\Account;
use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\ExpenseCategory;
use App\Models\GlobalSetting;
use App\Models\User;

test('a new-purchase asset creates an expense record that debits the payment account', function () {
    $user = User::factory()->admin()->create();
    $assetCategory = AssetCategory::create(['name' => 'Machinery', 'description' => 'd']);
    $account = Account::create(['name' => 'Bank', 'opening_balance' => 10000, 'current_balance' => 10000]);
    $assetPurchaseCategory = ExpenseCategory::create(['name' => 'Asset Purchase', 'description' => 'd']);
    GlobalSetting::set('asset_purchase_category_id', $assetPurchaseCategory->id);

    $response = $this->actingAs($user)->post(route('assets.store'), [
        'name' => 'New Machine',
        'description' => 'desc',
        'purchase_date' => now()->format('Y-m-d'),
        'cost' => 5000,
        'status' => 'Active',
        'asset_category_id' => $assetCategory->id,
        'is_new_purchase' => true,
        'account_id' => $account->id,
    ]);

    $response->assertSessionHasNoErrors();
    $asset = Asset::first();
    $this->assertDatabaseHas('expenses', [
        'asset_id' => $asset->id,
        'amount' => 5000,
        'account_id' => $account->id,
    ]);
    $this->assertDatabaseHas('expense_categories', ['name' => 'Asset Purchase']);
    expect((float) $account->fresh()->current_balance)->toBe(5000.0);
});

test('an existing (non-new-purchase) asset does not create an expense record', function () {
    $user = User::factory()->admin()->create();
    $assetCategory = AssetCategory::create(['name' => 'Machinery', 'description' => 'd']);

    $response = $this->actingAs($user)->post(route('assets.store'), [
        'name' => 'Existing Machine',
        'description' => 'desc',
        'purchase_date' => now()->format('Y-m-d'),
        'cost' => 3000,
        'status' => 'Active',
        'asset_category_id' => $assetCategory->id,
    ]);

    $response->assertSessionHasNoErrors();
    $asset = Asset::where('name', 'Existing Machine')->first();
    $this->assertDatabaseMissing('expenses', ['asset_id' => $asset->id]);
});

test('a new-purchase asset requires a payment account', function () {
    $user = User::factory()->admin()->create();
    $assetCategory = AssetCategory::create(['name' => 'Machinery', 'description' => 'd']);

    $response = $this->actingAs($user)->post(route('assets.store'), [
        'name' => 'New Machine',
        'description' => 'desc',
        'purchase_date' => now()->format('Y-m-d'),
        'cost' => 5000,
        'status' => 'Active',
        'asset_category_id' => $assetCategory->id,
        'is_new_purchase' => true,
    ]);

    $response->assertSessionHasErrors(['account_id']);
});

test('a second new-purchase asset reuses the existing Asset Purchase expense category', function () {
    $user = User::factory()->admin()->create();
    $assetCategory = AssetCategory::create(['name' => 'Machinery', 'description' => 'd']);
    $account = Account::create(['name' => 'Bank', 'opening_balance' => 10000, 'current_balance' => 10000]);
    $assetPurchaseCategory = ExpenseCategory::create(['name' => 'Asset Purchase', 'description' => 'd']);
    GlobalSetting::set('asset_purchase_category_id', $assetPurchaseCategory->id);

    $payload = [
        'description' => 'desc',
        'purchase_date' => now()->format('Y-m-d'),
        'cost' => 1000,
        'status' => 'Active',
        'asset_category_id' => $assetCategory->id,
        'is_new_purchase' => true,
        'account_id' => $account->id,
    ];

    $this->actingAs($user)->post(route('assets.store'), ['name' => 'Machine A'] + $payload);
    $this->actingAs($user)->post(route('assets.store'), ['name' => 'Machine B'] + $payload);

    expect(ExpenseCategory::where('name', 'Asset Purchase')->count())->toBe(1);
});
