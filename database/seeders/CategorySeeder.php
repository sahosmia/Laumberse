<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Gents Item', 'slug' => 'gents-item', 'description' => 'Laundry items for men'],
            ['name' => 'Ladies Item', 'slug' => 'ladies-item', 'description' => 'Laundry items for women'],
            ['name' => 'Kids Item', 'slug' => 'kids-item', 'description' => 'Laundry items for children'],
            ['name' => 'Household Item', 'slug' => 'household-item', 'description' => 'Household linens and fabrics'],
            ['name' => 'Others Item', 'slug' => 'others-item', 'description' => 'Everything else'],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(
                ['name' => $category['name']],
                ['slug' => $category['slug'], 'description' => $category['description']]
            );
        }
    }
}
