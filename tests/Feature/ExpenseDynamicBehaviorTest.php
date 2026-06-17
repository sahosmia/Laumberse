<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\ExpenseCategory;
use App\Models\Material;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExpenseDynamicBehaviorTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAs(User::factory()->create());
    }

    public function test_can_store_general_expense()
    {
        $category = ExpenseCategory::create(['name' => 'General', 'type' => 'general']);

        $response = $this->post(route('expenses.store'), [
            'expense_category_id' => $category->id,
            'total_amount' => 1000,
            'payment_method' => 'Cash',
            'date' => now()->toDateString(),
            'note' => 'Standard note',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('expenses', [
            'expense_category_id' => $category->id,
            'total_amount' => 1000,
            'note' => 'Standard note',
        ]);
    }

    public function test_can_store_material_expense()
    {
        $category = ExpenseCategory::create(['name' => 'Raw Materials', 'type' => 'material']);
        $material = Material::create(['name' => 'Fabric', 'unit_price' => 50]);

        $response = $this->post(route('expenses.store'), [
            'expense_category_id' => $category->id,
            'total_amount' => 500,
            'payment_method' => 'Cash',
            'date' => now()->toDateString(),
            'items' => [
                ['material_id' => $material->id, 'quantity' => 10, 'unit_price' => 50]
            ]
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('expenses', ['total_amount' => 500]);
        $this->assertDatabaseHas('expense_materials', [
            'material_id' => $material->id,
            'quantity' => 10,
            'unit_price' => 50,
            'amount' => 500,
        ]);
    }

    public function test_can_store_salary_expense()
    {
        $category = ExpenseCategory::create(['name' => 'Salary', 'type' => 'salary']);
        $employee = Employee::create([
            'name' => 'John Doe',
            'phone' => '123456789',
            'designation' => 'Worker',
            'base_salary' => 10000,
            'joining_date' => '2023-01-01',
        ]);

        $response = $this->post(route('expenses.store'), [
            'expense_category_id' => $category->id,
            'total_amount' => 15000,
            'payment_method' => 'Bank',
            'date' => now()->toDateString(),
            'employee_id' => $employee->id,
            'month' => 6,
            'year' => 2024,
            'bonus' => 1000,
            'deduction' => 500,
            'deduction_note' => 'Late'
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('expense_salaries', [
            'employee_id' => $employee->id,
            'month' => 6,
            'year' => 2024,
            'bonus' => 1000,
            'deduction' => 500,
        ]);
    }

    public function test_can_store_asset_expense()
    {
        $category = ExpenseCategory::create(['name' => 'Office Asset', 'type' => 'asset']);

        $response = $this->post(route('expenses.store'), [
            'expense_category_id' => $category->id,
            'total_amount' => 50000,
            'payment_method' => 'Check',
            'date' => now()->toDateString(),
            'serial_number' => 'LAPTOP-789',
            'depreciation' => 20,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('expense_assets', [
            'serial_number' => 'LAPTOP-789',
            'depreciation' => 20,
        ]);
    }
}
