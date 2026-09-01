<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Nullable at the schema level so the column can represent "no fixed home outlet" if that's ever
 * genuinely needed — but every user, Admin included, is backfilled to a real outlet below. Admin
 * already gets full cross-outlet access via the existing Gate::before role bypass (so it can
 * still switch to any outlet or "All Outlets" through App\Support\OutletContext regardless of
 * this column), but defaulting it to a concrete outlet — rather than null/"All" — means every
 * existing outlet-scoped create/update flow keeps working unchanged for it: nothing has to start
 * requiring an explicit outlet_id just because the acting user happens to be an Admin.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('outlet_id')->nullable()->after('id')->constrained()->nullOnDelete();
        });

        $defaultOutletId = DB::table('outlets')->where('code', 'MAIN')->value('id');

        if (! $defaultOutletId && DB::table('users')->exists()) {
            $defaultOutletId = DB::table('outlets')->insertGetId([
                'name' => 'Main Outlet',
                'code' => 'MAIN',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        if ($defaultOutletId) {
            DB::table('users')->whereNull('outlet_id')->update(['outlet_id' => $defaultOutletId]);
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('outlet_id');
        });
    }
};
