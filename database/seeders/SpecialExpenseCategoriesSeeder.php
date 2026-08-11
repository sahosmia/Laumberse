<?php

namespace Database\Seeders;

use App\Models\ExpenseCategory;
use App\Models\GlobalSetting;
use Illuminate\Database\Seeder;

class SpecialExpenseCategoriesSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'salary_category_id' => ['name' => 'Salary', 'description' => 'Employee salary payments'],
            'business_transportation_category_id' => ['name' => 'Business Transportation', 'description' => 'Business-related transportation costs'],
            'delivery_transportation_category_id' => ['name' => 'Delivery Transportation', 'description' => 'Delivery-related transportation costs'],
        ];

        foreach ($categories as $settingKey => $attributes) {
            $category = ExpenseCategory::firstOrCreate(
                ['name' => $attributes['name']],
                ['description' => $attributes['description']]
            );

            GlobalSetting::set($settingKey, $category->id);
        }
    }
}
