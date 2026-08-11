<?php

use App\Models\User;
use App\Models\ExpenseCategory;
use App\Models\GlobalSetting;

test('global settings page shows the transportation category selects', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('settings.global.edit'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->has('settings.business_transportation_category_id')
        ->has('settings.delivery_transportation_category_id')
    );
});

test('global settings can be updated with all four category ids', function () {
    $user = User::factory()->create();

    $salary = ExpenseCategory::create(['name' => 'Salary', 'description' => 'x']);
    $material = ExpenseCategory::create(['name' => 'Material', 'description' => 'x']);
    $business = ExpenseCategory::create(['name' => 'Business Transportation', 'description' => 'x']);
    $delivery = ExpenseCategory::create(['name' => 'Delivery Transportation', 'description' => 'x']);

    $response = $this->actingAs($user)->patch(route('settings.global.update'), [
        'salary_category_id' => $salary->id,
        'material_expense_category_id' => $material->id,
        'business_transportation_category_id' => $business->id,
        'delivery_transportation_category_id' => $delivery->id,
    ]);

    $response->assertRedirect();
    $response->assertSessionHasNoErrors();

    expect(GlobalSetting::get('business_transportation_category_id'))->toEqual($business->id);
    expect(GlobalSetting::get('delivery_transportation_category_id'))->toEqual($delivery->id);
});

test('global settings update fails without the transportation categories', function () {
    $user = User::factory()->create();

    $salary = ExpenseCategory::create(['name' => 'Salary', 'description' => 'x']);
    $material = ExpenseCategory::create(['name' => 'Material', 'description' => 'x']);

    $response = $this->actingAs($user)->patch(route('settings.global.update'), [
        'salary_category_id' => $salary->id,
        'material_expense_category_id' => $material->id,
    ]);

    $response->assertSessionHasErrors(['business_transportation_category_id', 'delivery_transportation_category_id']);
});
