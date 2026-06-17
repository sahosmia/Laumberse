<?php

namespace Tests\Feature;

use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\GlobalSetting;
use App\Models\Material;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExpenseMaterialTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $materialCategory;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->materialCategory = ExpenseCategory::create([
            'name' => 'Material',
            'type' => 'material'
        ]);
        GlobalSetting::set('material_expense_category_id', $this->materialCategory->id);
    }

    public function test_can_store_material_expense_with_items()
    {
        $material = Material::create(['name' => 'Fabric', 'market_price' => 100]);

        $data = [
            'expense_category_id' => $this->materialCategory->id,
            'amount' => 200.525, // Should be rounded to 200.53
            'payment_method' => 'Cash',
            'date' => now()->format('Y-m-d'),
            'description' => 'Buying fabric',
            'items' => [
                [
                    'material_id' => $material->id,
                    'quantity' => 2.001, // Should be rounded to 2.00
                    'unit_price' => 100.262 // Should be rounded to 100.26
                ]
            ]
        ];

        $response = $this->actingAs($this->user)->post(route('expenses.store'), $data);

        $response->assertRedirect();

        $expense = Expense::first();
        $this->assertEquals(200.52, $expense->amount);
        $this->assertCount(1, $expense->materials);

        $item = $expense->materials->first();
        $this->assertEquals(2.00, $item->quantity);
        $this->assertEquals(100.26, $item->unit_price);
        $this->assertEquals(200.52, $item->amount); // 2.00 * 100.26
    }
}
