<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Same safe nullable → backfill → constrain strategy as the users table's outlet_id (see
 * 2026_08_30_000002_add_outlet_id_to_users_table.php): every existing invoice is backfilled to the
 * "Main Outlet" so no pre-existing row is ever silently invisible once outlet scoping goes live.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->foreignId('outlet_id')->nullable()->after('id')->constrained()->restrictOnDelete();
        });

        $defaultOutletId = DB::table('outlets')->where('code', 'MAIN')->value('id');

        if ($defaultOutletId) {
            DB::table('invoices')->whereNull('outlet_id')->update(['outlet_id' => $defaultOutletId]);
        }
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropConstrainedForeignId('outlet_id');
        });
    }
};
