<?php

namespace Database\Seeders;

use App\Models\AssetCategory;
use Illuminate\Database\Seeder;

class AssetCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Machinery', 'description' => 'Industrial machines and equipment'],
            ['name' => 'Electronics', 'description' => 'Computers, laptops, and gadgets'],
            ['name' => 'Furniture', 'description' => 'Chairs, tables, and desks'],
            ['name' => 'Vehicles', 'description' => 'Delivery vans and company cars'],
            ['name' => 'Tools', 'description' => 'Small hand tools and maintenance kits'],
        ];

        foreach ($categories as $category) {
            AssetCategory::create($category);
        }
    }
}
