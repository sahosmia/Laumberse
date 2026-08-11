<?php

use App\Models\User;
use App\Models\ExpenseCategory;
use App\Models\Expense;
use App\Models\Employee;
use App\Models\Material;
use App\Models\GlobalSetting;

test('expense with price 0 cannot be stored', function () {
    $user = User::factory()->create();
    $category = ExpenseCategory::create(['name' => 'General', 'description' => 'General Expenses']);

    $data = [
        'expense_category_id' => $category->id,
        'amount' => 0,
        'payment_method' => 'Cash',
        'date' => now()->format('Y-m-d'),
        'description' => 'Test Zero Price',
    ];

    $response = $this->actingAs($user)->post(route('expenses.store'), $data);

    $response->assertSessionHasErrors(['amount']);
});

test('expense with price greater than 0 can be stored', function () {
    $user = User::factory()->create();
    $category = ExpenseCategory::create(['name' => 'General', 'description' => 'General Expenses']);

    $data = [
        'expense_category_id' => $category->id,
        'amount' => 150.50,
        'payment_method' => 'Cash',
        'date' => now()->format('Y-m-d'),
        'description' => 'Test Valid Price',
    ];

    $response = $this->actingAs($user)->post(route('expenses.store'), $data);

    $response->assertSessionHasNoErrors();
});

test('material expense with material item unit price of 0 cannot be stored', function () {
    $user = User::factory()->create();
    $category = ExpenseCategory::create(['name' => 'Material Purchases', 'description' => 'Material Expenses']);
    GlobalSetting::set('material_expense_category_id', $category->id);

    $material = Material::create(['name' => 'Fabric X']);

    $data = [
        'expense_category_id' => $category->id,
        'amount' => 100, // It will be recalculated or checked
        'payment_method' => 'Cash',
        'date' => now()->format('Y-m-d'),
        'description' => 'Test Material Price 0',
        'items' => [
            [
                'material_id' => $material->id,
                'quantity' => 10,
                'unit_price' => 0
            ]
        ]
    ];

    $response = $this->actingAs($user)->post(route('expenses.store'), $data);

    $response->assertSessionHasErrors(['items.0.unit_price']);
});

test('salary expense can be stored and creates a payroll record', function () {
    $user = User::factory()->create();
    $category = ExpenseCategory::create(['name' => 'Salary', 'description' => 'Employee Salaries']);
    GlobalSetting::set('salary_category_id', $category->id);

    $employee = Employee::create([
        'name' => 'Test Employee',
        'phone' => '01700000002',
        'designation' => 'Staff',
        'base_salary' => 20000,
        'is_active' => true,
    ]);

    $data = [
        'expense_category_id' => $category->id,
        'amount' => 20000,
        'payment_method' => 'Cash',
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
