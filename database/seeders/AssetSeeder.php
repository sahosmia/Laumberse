<?php

namespace Database\Seeders;

use App\Enums\AssetStatus;
use App\Models\Account;
use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\ExpenseCategory;
use App\Services\ExpenseService;
use Illuminate\Database\Seeder;

class AssetSeeder extends Seeder
{
    public function run(): void
    {
        $machinery = AssetCategory::where('name', 'Machinery')->firstOrFail();
        $electronics = AssetCategory::where('name', 'Electronics')->firstOrFail();
        $furniture = AssetCategory::where('name', 'Furniture')->firstOrFail();

        // 1. Existing assets (already owned, no purchase expense to record)
        Asset::firstOrCreate(['name' => 'Washing Machine A1'], [
            'description' => 'Industrial grade washing machine',
            'purchase_date' => '2023-01-15',
            'cost' => 85000,
            'status' => AssetStatus::Active->value,
            'asset_category_id' => $machinery->id,
        ]);

        Asset::firstOrCreate(['name' => 'Reception Desk'], [
            'description' => 'Oak wood desk',
            'purchase_date' => '2023-02-10',
            'cost' => 15000,
            'status' => AssetStatus::Active->value,
            'asset_category_id' => $furniture->id,
        ]);

        Asset::firstOrCreate(['name' => 'Ergonomic Chair'], [
            'description' => 'High back mesh chair',
            'purchase_date' => '2024-05-20',
            'cost' => 12500,
            'status' => AssetStatus::Maintenance->value,
            'asset_category_id' => $furniture->id,
        ]);

        // 2. New purchase — demonstrates an asset purchase debiting a real payment account.
        if (Asset::where('name', 'Developer Laptop')->exists()) {
            return;
        }

        $assetPurchaseCategory = ExpenseCategory::where('name', 'Asset Purchase')->firstOrFail();
        $bank = Account::where('name', 'Bank')->first();

        $laptop = Asset::create([
            'name' => 'Developer Laptop',
            'description' => 'MacBook Pro M2 16GB',
            'purchase_date' => date('Y-m-d'),
            'cost' => 245000,
            'status' => AssetStatus::Active->value,
            'asset_category_id' => $electronics->id,
        ]);

        if ($bank) {
            app(ExpenseService::class)->storeExpense([
                'expense_category_id' => $assetPurchaseCategory->id,
                'asset_id' => $laptop->id,
                'amount' => $laptop->cost,
                'account_id' => $bank->id,
                'date' => $laptop->purchase_date,
                'description' => "Purchase of asset: {$laptop->name}",
            ]);
        }
    }
}
