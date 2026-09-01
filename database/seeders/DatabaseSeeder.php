<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * One seeder per table (see each class for its table), called in
     * dependency order — every seeder here is safe to re-run without
     * creating duplicates, except DemoYearSeeder which only generates its
     * randomized year of demo activity once (see its own guard).
     */
    public function run(): void
    {
        $this->call([
            // Outlets
            OutletSeeder::class,

            // Access control
            PermissionSeeder::class,
            RoleSeeder::class,
            UserSeeder::class,

            // Catalog
            UnitSeeder::class,
            CategorySeeder::class,
            ProductSeeder::class,

            // Expenses & materials
            ExpenseCategorySeeder::class,
            // MaterialSeeder::class,

            // Assets
            AssetCategorySeeder::class,

            // Finance
            // AccountSeeder::class,
            // AssetSeeder::class,

            // Staff
            // EmployeeSeeder::class,
            // EmployeeTransactionSeeder::class,
            // InvestorSeeder::class,
            // CompanyLoanSeeder::class,

            // Clients & sales demo data
            // ClientSeeder::class,
            // ClientActivitySeeder::class,

            // A full ~13-month history of interlinked activity (invoices, payroll, expenses,
            // investor/loan/employee transactions, transfers, client follow-ups) across every
            // ledger above, so date filters and running-balance reports have real data to check.
            // DemoYearSeeder::class,
        ]);
    }
}
