<?php

namespace Database\Seeders;

use App\Models\Material;
use App\Models\Unit;
use Illuminate\Database\Seeder;

class MaterialSeeder extends Seeder
{
    public function run(): void
    {
        $units = Unit::all();
        $kgUnit = $units->where('short_name', 'kg')->first();
        $pcsUnit = $units->where('short_name', 'pcs')->first();

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
