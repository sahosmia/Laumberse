<?php

use App\Models\Account;
use App\Models\AssetCategory;
use App\Models\Employee;
use App\Models\ExpenseCategory;
use App\Models\GlobalSetting;
use App\Models\Material;
use App\Models\User;

test('expense with price 0 cannot be stored', function () {
    $user = User::factory()->admin()->create();
    $category = ExpenseCategory::create(['name' => 'General', 'description' => 'General Expenses']);
    $account = Account::create(['name' => 'Cash', 'opening_balance' => 0, 'current_balance' => 0]);

    $data = [
        'expense_category_id' => $category->id,
        'account_id' => $account->id,
        'amount' => 0,
        'date' => now()->format('Y-m-d'),
        'description' => 'Test Zero Price',
    ];

    $response = $this->actingAs($user)->post(route('expenses.store'), $data);

    $response->assertSessionHasErrors(['amount']);
});

test('expense with price greater than 0 can be stored', function () {
    $user = User::factory()->admin()->create();
    $category = ExpenseCategory::create(['name' => 'General', 'description' => 'General Expenses']);
    $account = Account::create(['name' => 'Cash', 'opening_balance' => 0, 'current_balance' => 0]);

    $data = [
        'expense_category_id' => $category->id,
        'account_id' => $account->id,
        'amount' => 150.50,
        'date' => now()->format('Y-m-d'),
        'description' => 'Test Valid Price',
    ];

    $response = $this->actingAs($user)->post(route('expenses.store'), $data);

    $response->assertSessionHasNoErrors();
});

test('expense without a payment account cannot be stored', function () {
    $user = User::factory()->admin()->create();
    $category = ExpenseCategory::create(['name' => 'General', 'description' => 'General Expenses']);

    $response = $this->actingAs($user)->post(route('expenses.store'), [
        'expense_category_id' => $category->id,
        'amount' => 100,
        'date' => now()->format('Y-m-d'),
    ]);

    $response->assertSessionHasErrors(['account_id']);
});

test('material expense with material item unit price of 0 cannot be stored', function () {
    $user = User::factory()->admin()->create();
    $category = ExpenseCategory::create(['name' => 'Material Purchases', 'description' => 'Material Expenses']);
    GlobalSetting::set('material_expense_category_id', $category->id);
    $account = Account::create(['name' => 'Cash', 'opening_balance' => 0, 'current_balance' => 0]);

    $material = Material::create(['name' => 'Fabric X']);

    $data = [
        'expense_category_id' => $category->id,
        'account_id' => $account->id,
        'amount' => 100, // It will be recalculated or checked
        'date' => now()->format('Y-m-d'),
        'description' => 'Test Material Price 0',
        'items' => [
            [
                'material_id' => $material->id,
                'quantity' => 10,
                'unit_price' => 0,
            ],
        ],
    ];

    $response = $this->actingAs($user)->post(route('expenses.store'), $data);

    $response->assertSessionHasErrors(['items.0.unit_price']);
});

test('salary expense can be stored and creates a payroll record', function () {
    $user = User::factory()->admin()->create();
    $category = ExpenseCategory::create(['name' => 'Salary', 'description' => 'Employee Salaries']);
    GlobalSetting::set('salary_category_id', $category->id);
    $account = Account::create(['name' => 'Bank', 'opening_balance' => 50000, 'current_balance' => 50000]);

    $employee = Employee::create([
        'name' => 'Test Employee',
        'phone' => '01700000002',
        'designation' => 'Staff',
        'base_salary' => 20000,
        'is_active' => true,
    ]);

    $data = [
        'expense_category_id' => $category->id,
        'account_id' => $account->id,
        'amount' => 20000,
        'date' => now()->format('Y-m-d'),
        'description' => 'Salary payment',
        'employee_id' => $employee->id,
        'month' => now()->month,
        'year' => now()->year,
        'bonus' => 0,
        'deduction' => 0,
    ];

    $response = $this->actingAs($user)->post(route('expenses.store'), $data);

    $response->assertSessionHasNoErrors();
    $this->assertDatabaseHas('expenses', [
        'expense_category_id' => $category->id,
        'amount' => 20000,
    ]);
    $this->assertDatabaseHas('payrolls', [
        'employee_id' => $employee->id,
        'net_salary' => 20000,
        'status' => 'completed',
    ]);
});

test('asset purchase expense can be stored from the expense form and creates an asset record', function () {
    $user = User::factory()->admin()->create();
    $category = ExpenseCategory::create(['name' => 'Asset Purchase', 'description' => 'Asset Purchases']);
    GlobalSetting::set('asset_purchase_category_id', $category->id);
    $assetCategory = AssetCategory::create(['name' => 'Electronics']);
    $account = Account::create(['name' => 'Bank', 'opening_balance' => 50000, 'current_balance' => 50000]);

    $data = [
        'expense_category_id' => $category->id,
        'account_id' => $account->id,
        'amount' => 35000,
        'date' => now()->format('Y-m-d'),
        'description' => 'Bought a laptop',
        'asset_name' => 'Dell Laptop',
        'asset_category_id' => $assetCategory->id,
        'asset_status' => 'Active',
    ];

    $response = $this->actingAs($user)->post(route('expenses.store'), $data);

    $response->assertSessionHasNoErrors();
    $this->assertDatabaseHas('expenses', [
        'expense_category_id' => $category->id,
        'amount' => 35000,
        'type' => 'asset',
    ]);
    $this->assertDatabaseHas('assets', [
        'name' => 'Dell Laptop',
        'asset_category_id' => $assetCategory->id,
        'cost' => 35000,
        'status' => 'Active',
    ]);
});

test('asset purchase expense requires asset name and category', function () {
    $user = User::factory()->admin()->create();
    $category = ExpenseCategory::create(['name' => 'Asset Purchase', 'description' => 'Asset Purchases']);
    GlobalSetting::set('asset_purchase_category_id', $category->id);
    $account = Account::create(['name' => 'Bank', 'opening_balance' => 50000, 'current_balance' => 50000]);

    $response = $this->actingAs($user)->post(route('expenses.store'), [
        'expense_category_id' => $category->id,
        'account_id' => $account->id,
        'amount' => 35000,
        'date' => now()->format('Y-m-d'),
    ]);

    $response->assertSessionHasErrors(['asset_name', 'asset_category_id']);
});
