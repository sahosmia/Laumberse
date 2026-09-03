<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Editing the enum() list in the invoices baseline (2026_08_25_000013) only affects a fresh
 * `migrate:fresh` — it doesn't retroactively alter an already-created table or fix rows that were
 * inserted while 'Pending'/'Processing' were still valid. Without this, App\Enums\InvoiceStatus's
 * backed-enum cast throws a ValueError the moment Eloquent reads any row still holding one of
 * those two removed values ("Processing" is not a valid backing value for enum
 * App\Enums\InvoiceStatus). Backfill runs BEFORE narrowing the column so no row is ever left
 * holding a value the new enum type doesn't allow.
 *
 * MySQL-only: SQLite (every test run, via RefreshDatabase) always migrates fresh from the
 * already-updated baseline enum list in 2026_08_25_000013_create_invoices_table.php, so there's
 * no pre-existing stale data or column type to fix there — only the real, already-created MySQL
 * database needs this raw ALTER.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (DB::connection()->getDriverName() !== 'mysql') {
            return;
        }

        DB::table('invoices')->whereIn('status', ['Pending', 'Processing'])->update(['status' => 'In House']);

        DB::statement("ALTER TABLE invoices MODIFY status ENUM('In House', 'Pre Wash', 'Washing', 'Extract', 'Drying', 'Pressing', 'Ready', 'Delivered', 'Cancelled') NOT NULL");
    }

    public function down(): void
    {
        if (DB::connection()->getDriverName() !== 'mysql') {
            return;
        }

        DB::statement("ALTER TABLE invoices MODIFY status ENUM('Pending', 'Processing', 'In House', 'Delivered', 'Cancelled') NOT NULL");
    }
};
