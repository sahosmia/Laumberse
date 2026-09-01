<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Same safe nullable → backfill strategy as client_activities.outlet_id (see
 * 2026_08_30_000008_add_outlet_id_to_client_activities_table.php). The Investor (the person)
 * stays GLOBAL — only each cash-moving transaction is outlet-scoped, including the opening-balance
 * row created by InvestorService::createInvestor() — an investor's starting money still belongs to
 * some outlet, so it's backfilled the same as every other transaction (no exception for a null
 * account_id).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('investor_transactions', function (Blueprint $table) {
            $table->foreignId('outlet_id')->nullable()->after('id')->constrained()->restrictOnDelete();
        });

        $defaultOutletId = DB::table('outlets')->where('code', 'MAIN')->value('id');

        if ($defaultOutletId) {
            DB::table('investor_transactions')->whereNull('outlet_id')->update(['outlet_id' => $defaultOutletId]);
        }
    }

    public function down(): void
    {
        Schema::table('investor_transactions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('outlet_id');
        });
    }
};
