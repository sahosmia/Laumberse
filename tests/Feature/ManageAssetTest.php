<?php

namespace Tests\Feature;

use App\Models\AssetCategory;
use App\Models\ManageAsset;
use App\Models\User;
use App\Models\Expense;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ManageAssetTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_can_list_assets()
    {
        $response = $this->actingAs($this->user)->get(route('manage-assets.index'));
        $response->assertStatus(200);
    }

    public function test_can_create_asset_category()
    {
        $response = $this->actingAs($this->user)->post(route('asset-categories.store'), [
            'name' => 'IT Equipment',
            'description' => 'Laptops, Monitors, etc.',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('asset_categories', ['name' => 'IT Equipment']);
    }

    public function test_can_create_asset_without_expense()
    {
        $category = AssetCategory::create(['name' => 'Furniture']);

        $response = $this->actingAs($this->user)->post(route('manage-assets.store'), [
            'name' => 'Office Chair',
            'description' => 'Ergonomic chair',
            'purchase_date' => '2023-01-01',
            'cost' => 5000,
            'status' => 'Active',
            'asset_category_id' => $category->id,
            'is_new_purchase' => false,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('manage_assets', [
            'name' => 'Office Chair',
            'asset_category_id' => $category->id,
        ]);

        $this->assertEquals(0, Expense::count());
    }

    public function test_can_create_asset_with_expense()
    {
        $category = AssetCategory::create(['name' => 'IT']);

        $response = $this->actingAs($this->user)->post(route('manage-assets.store'), [
            'name' => 'MacBook Pro',
            'description' => 'M2 Max',
            'purchase_date' => '2023-06-01',
            'cost' => 300000,
            'status' => 'Active',
            'asset_category_id' => $category->id,
            'is_new_purchase' => true,
            'payment_method' => 'Bank Transfer',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('manage_assets', ['name' => 'MacBook Pro']);
        $this->assertDatabaseHas('expenses', [
            'amount' => 300000,
            'payment_method' => 'Bank Transfer',
            'description' => 'Purchase of asset: MacBook Pro',
        ]);

        $asset = ManageAsset::where('name', 'MacBook Pro')->first();
        $expense = Expense::first();
        $this->assertEquals($asset->id, $expense->manage_asset_id);
    }
}
