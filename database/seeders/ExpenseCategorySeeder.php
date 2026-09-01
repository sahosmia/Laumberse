<?php

namespace Database\Seeders;

use App\Models\ExpenseCategory;
use App\Models\GlobalSetting;
use Illuminate\Database\Seeder;

class ExpenseCategorySeeder extends Seeder
{
    public function run(): void
    {
        // Categories that also get recorded as a GlobalSetting (other modules look them up by key).
        $withSettingKey = [
            'material_expense_category_id' => ['name' => 'Material', 'description' => 'Expenses for raw materials'],
            'salary_category_id' => ['name' => 'Salary', 'description' => 'Employee salary payments'],
            'asset_purchase_category_id' => ['name' => 'Asset Purchase', 'description' => 'Expenses related to new asset purchases'],
            'business_transportation_category_id' => ['name' => 'Business Transportation', 'description' => 'Business-related transportation costs'],
            'delivery_transportation_category_id' => ['name' => 'Delivery Transportation', 'description' => 'Delivery-related transportation costs'],
        ];

        foreach ($withSettingKey as $settingKey => $attributes) {
            $category = ExpenseCategory::firstOrCreate(
                ['name' => $attributes['name']],
                ['description' => $attributes['description']]
            );

            GlobalSetting::set($settingKey, $category->id);
        }
    }
}
