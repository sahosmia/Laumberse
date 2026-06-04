<?php

namespace Tests\Feature;

use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExpenseCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_expense()
    {
        $user = User::factory()->create();
        $category = ExpenseCategory::create(['name' => 'General']);

        $response = $this->actingAs($user)->post(route('expenses.store'), [
            'expense_category_id' => $category->id,
            'amount' => 500,
            'payment_method' => 'Cash',
            'date' => '2023-01-01',
            'description' => 'Test Expense',
        ]);

        $response->assertStatus(302);
        $this->assertDatabaseHas('expenses', [
            'amount' => 500,
            'description' => 'Test Expense',
        ]);
    }
}
