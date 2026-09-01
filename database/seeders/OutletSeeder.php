<?php

namespace Database\Seeders;

use App\Models\Outlet;
use Illuminate\Database\Seeder;

class OutletSeeder extends Seeder
{
    public function run(): void
    {
        Outlet::firstOrCreate(
            ['code' => 'MAIN'],
            ['name' => 'Main Outlet', 'status' => 'active'],
        );
    }
}
