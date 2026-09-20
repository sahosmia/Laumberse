<?php

use App\Models\User;
use App\Models\ExpenseCategory;
use App\Models\GlobalSetting;

test('global settings page shows the transportation category selects', function () {
    $user = User::factory()->admin()->create();

    $response = $this->actingAs($user)->get(route('settings.global.edit'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->has('settings.business_transportation_category_id')
        ->has('settings.delivery_transportation_category_id')
    );
});

test('global settings can be updated with all five category ids', function () {
    $user = User::factory()->admin()->create();

    $salary = ExpenseCategory::create(['name' => 'Salary', 'description' => 'x']);
    $material = ExpenseCategory::create(['name' => 'Material', 'description' => 'x']);
    $assetPurchase = ExpenseCategory::create(['name' => 'Asset Purchase', 'description' => 'x']);
    $business = ExpenseCategory::create(['name' => 'Business Transportation', 'description' => 'x']);
    $delivery = ExpenseCategory::create(['name' => 'Delivery Transportation', 'description' => 'x']);

    $response = $this->actingAs($user)->patch(route('settings.global.categories.update'), [
        'salary_category_id' => $salary->id,
        'material_expense_category_id' => $material->id,
        'asset_purchase_category_id' => $assetPurchase->id,
        'business_transportation_category_id' => $business->id,
        'delivery_transportation_category_id' => $delivery->id,
    ]);

    $response->assertRedirect();
    $response->assertSessionHasNoErrors();

    expect(GlobalSetting::get('asset_purchase_category_id'))->toEqual($assetPurchase->id);
    expect(GlobalSetting::get('business_transportation_category_id'))->toEqual($business->id);
    expect(GlobalSetting::get('delivery_transportation_category_id'))->toEqual($delivery->id);
});

test('global settings categories update fails without the transportation categories', function () {
    $user = User::factory()->admin()->create();

    $salary = ExpenseCategory::create(['name' => 'Salary', 'description' => 'x']);
    $material = ExpenseCategory::create(['name' => 'Material', 'description' => 'x']);

    $response = $this->actingAs($user)->patch(route('settings.global.categories.update'), [
        'salary_category_id' => $salary->id,
        'material_expense_category_id' => $material->id,
    ]);

    $response->assertSessionHasErrors(['business_transportation_category_id', 'delivery_transportation_category_id']);
});

test('the business week can be updated on its own, independent of the workflow categories', function () {
    $user = User::factory()->admin()->create();

    $response = $this->actingAs($user)->patch(route('settings.global.week.update'), [
        'week_start_day' => 1,
    ]);

    $response->assertRedirect();
    $response->assertSessionHasNoErrors();
    expect(GlobalSetting::get('week_start_day'))->toEqual(1);
});

test('business information can be updated on its own, independent of the workflow categories', function () {
    $user = User::factory()->admin()->create();

    $response = $this->actingAs($user)->patch(route('settings.global.business.update'), [
        'business_name' => 'Launverse Laundry',
        'business_phone' => '01700000000',
    ]);

    $response->assertRedirect();
    $response->assertSessionHasNoErrors();
    expect(GlobalSetting::get('business_name'))->toEqual('Launverse Laundry');
});
