<?php

namespace Database\Seeders;

use App\Models\ExpenseCategory;
use App\Models\GlobalSetting;
use App\Models\Material;
use Illuminate\Database\Seeder;

class MaterialExpenseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create a default "Material" category
        $category = ExpenseCategory::firstOrCreate(['name' => 'Material'], ['description' => 'Expenses for raw materials']);

        // 2. Set the config key-value pair in settings table
        GlobalSetting::set('material_expense_category_id', $category->id);

        // 3. Seed some dummy materials
        $materials = [
            ['name' => 'Fabric A', 'market_price' => 150.00],
            ['name' => 'Thread Roll', 'market_price' => 25.50],
            ['name' => 'Buttons (Gross)', 'market_price' => 45.00],
            ['name' => 'Elastic Band', 'market_price' => 12.75],
            ['name' => 'Zippers', 'market_price' => 8.50],
        ];

        foreach ($materials as $material) {
            Material::firstOrCreate(['name' => $material['name']], ['market_price' => $material['market_price']]);
        }
    }
}
