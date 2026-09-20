<?php

use App\Models\Account;
use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\ExpenseCategory;
use App\Models\GlobalSetting;
use App\Models\User;

function createNewPurchaseAsset(string $name, float $cost, Account $account, AssetCategory $category): Asset
{
    test()->post(route('assets.store'), [
        'name' => $name,
        'purchase_date' => now()->format('Y-m-d'),
        'cost' => $cost,
        'status' => 'Active',
        'asset_category_id' => $category->id,
        'is_new_purchase' => true,
        'account_id' => $account->id,
    ]);

    return Asset::where('name', $name)->firstOrFail();
}

test('editing a new-purchase asset\'s cost reverses the old debit and applies the new one', function () {
    $user = User::factory()->admin()->create();
    test()->actingAs($user);
    $assetCategory = AssetCategory::create(['name' => 'Machinery', 'description' => 'd']);
    $account = Account::create(['name' => 'Bank', 'opening_balance' => 10000, 'current_balance' => 10000]);
    $assetPurchaseCategory = ExpenseCategory::create(['name' => 'Asset Purchase', 'description' => 'd']);
    GlobalSetting::set('asset_purchase_category_id', $assetPurchaseCategory->id);

    $asset = createNewPurchaseAsset('Laptop', 5000, $account, $assetCategory);
    expect((float) $account->fresh()->current_balance)->toBe(5000.0); // 10000 - 5000

    $response = test()->put(route('assets.update', $asset), [
        'name' => 'Laptop',
        'purchase_date' => now()->format('Y-m-d'),
        'cost' => 7000,
        'status' => 'Active',
        'asset_category_id' => $assetCategory->id,
    ]);

    $response->assertSessionHasNoErrors();

    // The original 5000 debit is reversed (back to 10000) and the new 7000 cost is re-debited.
    expect((float) $account->fresh()->current_balance)->toBe(3000.0); // 10000 - 7000
    $this->assertDatabaseHas('expenses', [
        'asset_id' => $asset->id,
        'amount' => 7000,
        'account_id' => $account->id,
    ]);
});

test('editing a non-purchase asset\'s cost does not touch any account balance', function () {
    $user = User::factory()->admin()->create();
    $assetCategory = AssetCategory::create(['name' => 'Machinery', 'description' => 'd']);
    $account = Account::create(['name' => 'Bank', 'opening_balance' => 10000, 'current_balance' => 10000]);

    $this->actingAs($user)->post(route('assets.store'), [
        'name' => 'Donated Chair',
        'purchase_date' => now()->format('Y-m-d'),
        'cost' => 100,
        'status' => 'Active',
        'asset_category_id' => $assetCategory->id,
    ]);
    $asset = Asset::where('name', 'Donated Chair')->firstOrFail();

    $response = $this->actingAs($user)->put(route('assets.update', $asset), [
        'name' => 'Donated Chair',
        'purchase_date' => now()->format('Y-m-d'),
        'cost' => 500,
        'status' => 'Active',
        'asset_category_id' => $assetCategory->id,
    ]);

    $response->assertSessionHasNoErrors();
    expect((float) $account->fresh()->current_balance)->toBe(10000.0);
    expect((float) $asset->fresh()->cost)->toBe(500.0);
});
