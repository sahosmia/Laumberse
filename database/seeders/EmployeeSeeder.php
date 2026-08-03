<?php

namespace Database\Seeders;

use App\Models\Employee;
use Illuminate\Database\Seeder;

class EmployeeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $employees = [
            [
                'name' => 'John Doe',
                'phone' => '+15550192',
                'email' => 'john.doe@company.com',
                'designation' => 'Laundry Operator',
                'base_salary' => 75000.00,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Jane Smith',
                'phone' => '+15550193',
                'email' => 'jane.smith@company.com',
                'designation' => 'Store Manager',
                'base_salary' => 82000.00,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Robert Johnson',
                'phone' => null,
                'email' => 'robert.j@company.com',
                'designation' => 'Delivery Boy',
                'base_salary' => 45000.00,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Emily Davis',
                'phone' => '+15550194',
                'email' => null,
                'designation' => 'Cleaner',
                'base_salary' => 55000.00,
                'is_active' => false, // Former employee
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        // Using insert() is much faster than running a foreach loop with Eloquent::create()
        Employee::insert($employees);
    }
}
