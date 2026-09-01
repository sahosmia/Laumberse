<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Same safe nullable → backfill → constrain strategy as invoices.outlet_id (see
 * 2026_08_30_000003_add_outlet_id_to_invoices_table.php). Payroll and EmployeeTransaction records
 * are NOT given their own outlet_id — they're always reached through their employee_id relation,
 * so scoping the Employee itself is sufficient (same reasoning as InvoiceItem not needing one).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->foreignId('outlet_id')->nullable()->after('id')->constrained()->restrictOnDelete();
        });

        $defaultOutletId = DB::table('outlets')->where('code', 'MAIN')->value('id');

        if ($defaultOutletId) {
            DB::table('employees')->whereNull('outlet_id')->update(['outlet_id' => $defaultOutletId]);
        }
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropConstrainedForeignId('outlet_id');
        });
    }
};
