<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Same safe nullable → backfill → constrain strategy as invoices.outlet_id (see
 * 2026_08_30_000003_add_outlet_id_to_invoices_table.php). The Client this activity belongs to
 * stays GLOBAL (visible from every outlet) — only the activity record itself is outlet-scoped.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('client_activities', function (Blueprint $table) {
            $table->foreignId('outlet_id')->nullable()->after('id')->constrained()->restrictOnDelete();
        });

        $defaultOutletId = DB::table('outlets')->where('code', 'MAIN')->value('id');

        if ($defaultOutletId) {
            DB::table('client_activities')->whereNull('outlet_id')->update(['outlet_id' => $defaultOutletId]);
        }
    }

    public function down(): void
    {
        Schema::table('client_activities', function (Blueprint $table) {
            $table->dropConstrainedForeignId('outlet_id');
        });
    }
};
