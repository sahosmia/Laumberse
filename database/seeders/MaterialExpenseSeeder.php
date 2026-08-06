<?php

namespace Database\Seeders;

use App\Models\ExpenseCategory;
use App\Models\GlobalSetting;
use App\Models\Material;
use App\Models\Unit;
use Illuminate\Database\Seeder;

class MaterialExpenseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create a default "Material" category
        $category = ExpenseCategory::firstOrCreate(['name' => 'Material'], ['description' => 'Expenses for raw materials']);

        // 2. Set the config key-value pair in settings table
        GlobalSetting::set('material_expense_category_id', $category->id);

        // Create a default "Salary" category
        $salaryCategory = ExpenseCategory::firstOrCreate(['name' => 'Salary'], ['description' => 'Expenses for employee salary']);
        GlobalSetting::set('salary_category_id', $salaryCategory->id);

        // 3. Get existing units to link with materials
        $units = Unit::all();
        $kgUnit = $units->where('short_name', 'kg')->first();
        $pcsUnit = $units->where('short_name', 'pcs')->first();

        // 4. Seed some dummy materials
        $materials = [
            ['name' => 'Fabric A', 'unit_id' => $kgUnit?->id],
            ['name' => 'Thread Roll', 'unit_id' => $pcsUnit?->id],
            ['name' => 'Buttons (Gross)', 'unit_id' => $pcsUnit?->id],
            ['name' => 'Elastic Band', 'unit_id' => $kgUnit?->id],
            ['name' => 'Zippers', 'unit_id' => $pcsUnit?->id],
        ];

        foreach ($materials as $material) {
            Material::firstOrCreate(
                ['name' => $material['name']],
                ['unit_id' => $material['unit_id']]
            );
        }
    }
}
