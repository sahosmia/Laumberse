<?php

namespace Database\Seeders;

use App\Enums\AssetStatus;
use App\Models\AssetCategory;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\ManageAsset;
use Illuminate\Database\Seeder;

class ManageAssetSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $machinery = AssetCategory::where('name', 'Machinery')->first();
        $electronics = AssetCategory::where('name', 'Electronics')->first();
        $furniture = AssetCategory::where('name', 'Furniture')->first();

        // 1. Existing Assets (No expenses)
        ManageAsset::create([
            'name' => 'Washing Machine A1',
            'description' => 'Industrial grade washing machine',
            'purchase_date' => '2023-01-15',
            'cost' => 85000,
            'status' => AssetStatus::Active->value,
            'asset_category_id' => $machinery->id,
        ]);

        ManageAsset::create([
            'name' => 'Reception Desk',
            'description' => 'Oak wood desk',
            'purchase_date' => '2023-02-10',
            'cost' => 15000,
            'status' => AssetStatus::Active->value,
            'asset_category_id' => $furniture->id,
        ]);

        // 2. New Purchase (With Expense)
        $assetPurchaseCategory = ExpenseCategory::firstOrCreate(
            ['name' => 'Asset Purchase'],
            ['description' => 'Expenses related to new asset purchases']
        );

        $laptop = ManageAsset::create([
            'name' => 'Developer Laptop',
            'description' => 'MacBook Pro M2 16GB',
            'purchase_date' => date('Y-m-d'),
            'cost' => 245000,
            'status' => AssetStatus::Active->value,
            'asset_category_id' => $electronics->id,
        ]);

        Expense::create([
            'expense_category_id' => $assetPurchaseCategory->id,
            'manage_asset_id' => $laptop->id,
            'amount' => $laptop->cost,
            'payment_method' => 'Bank Transfer',
            'date' => $laptop->purchase_date,
            'description' => "Purchase of asset: {$laptop->name}",
        ]);

        ManageAsset::create([
            'name' => 'Ergonomic Chair',
            'description' => 'High back mesh chair',
            'purchase_date' => '2024-05-20',
            'cost' => 12500,
            'status' => AssetStatus::Maintenance->value,
            'asset_category_id' => $furniture->id,
        ]);
    }
}
