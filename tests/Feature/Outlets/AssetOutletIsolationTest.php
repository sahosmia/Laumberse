<?php

use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\Outlet;
use App\Models\User;

/** Same security matrix pattern as InvoiceOutletIsolationTest — see that file's header comment. */
function makeAssetFor(User $user, array $overrides = []): Asset
{
    $category = AssetCategory::create(['name' => 'Cat-'.uniqid()]);

    $data = array_merge([
        'name' => 'Asset-'.uniqid(),
        'purchase_date' => now()->format('Y-m-d'),
        'cost' => 1000,
        'status' => 'Active',
        'asset_category_id' => $category->id,
    ], $overrides);

    test()->actingAs($user)->post(route('assets.store'), $data)->assertSessionHasNoErrors();

    return Asset::latest('id')->first();
}

test('a user only sees assets from their own outlet in the index', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Manager');
    $userB = User::factory()->for($outletB, 'outlet')->create();
    $userB->assignRole('Manager');

    $assetA = makeAssetFor($userA);
    $assetB = makeAssetFor($userB);

    $response = test()->actingAs($userA)->get(route('assets.index'));

    $ids = collect($response->viewData('page')['props']['assets']['data'])->pluck('id');
    expect($ids)->toContain($assetA->id);
    expect($ids)->not->toContain($assetB->id);
});

test('a user cannot update another outlet\'s asset', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Manager');
    $userB = User::factory()->for($outletB, 'outlet')->create();
    $userB->assignRole('Manager');

    $assetB = makeAssetFor($userB);
    $originalName = $assetB->name;

    test()->actingAs($userA)->put(route('assets.update', $assetB), [
        'name' => 'Hacked Name',
        'purchase_date' => $assetB->purchase_date,
        'cost' => $assetB->cost,
        'status' => 'Active',
        'asset_category_id' => $assetB->asset_category_id,
    ])->assertNotFound();

    expect($assetB->fresh()->name)->toBe($originalName);
});

test('a user cannot delete another outlet\'s asset', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Manager');
    $userB = User::factory()->for($outletB, 'outlet')->create();
    $userB->assignRole('Manager');

    $assetB = makeAssetFor($userB);

    test()->actingAs($userA)->delete(route('assets.destroy', $assetB))->assertNotFound();

    expect(Asset::find($assetB->id))->not->toBeNull();
});

test('an asset is always assigned to the creator\'s own outlet, even if a different outlet_id is forged in the payload', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Manager');

    $asset = makeAssetFor($userA, ['outlet_id' => $outletB->id]);

    expect($asset->outlet_id)->toBe($userA->outlet_id)
        ->and($asset->outlet_id)->not->toBe($outletB->id);
});

test('an admin who switches to All Outlets sees assets from every outlet', function () {
    $outletB = Outlet::factory()->create();
    $admin = User::factory()->admin()->create();
    $userB = User::factory()->for($outletB, 'outlet')->create();
    $userB->assignRole('Manager');

    $assetAdmin = makeAssetFor($admin);
    $assetB = makeAssetFor($userB);

    test()->actingAs($admin)->post(route('outlet-context.update'), ['outlet' => 'all'])
        ->assertRedirect()->assertSessionHasNoErrors();

    $response = test()->actingAs($admin)->get(route('assets.index'));

    $ids = collect($response->viewData('page')['props']['assets']['data'])->pluck('id');
    expect($ids)->toContain($assetAdmin->id);
    expect($ids)->toContain($assetB->id);
});

test('creating an asset while viewing All Outlets requires a valid outlet_id', function () {
    $admin = User::factory()->admin()->create();
    test()->actingAs($admin)->post(route('outlet-context.update'), ['outlet' => 'all'])
        ->assertRedirect()->assertSessionHasNoErrors();

    $category = AssetCategory::create(['name' => 'Cat']);

    $response = test()->actingAs($admin)->post(route('assets.store'), [
        'name' => 'New Asset',
        'purchase_date' => now()->format('Y-m-d'),
        'cost' => 1000,
        'status' => 'Active',
        'asset_category_id' => $category->id,
    ]);

    $response->assertSessionHasErrors(['outlet_id']);
});
