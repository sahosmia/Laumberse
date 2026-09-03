<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Unlike every other outlet_id column added so far, this one is NOT an access-control boundary —
 * Client stays a GLOBAL record (any staff member can view/edit any client regardless of outlet).
 * It exists purely so a client can be attributed to an outlet ("which outlet is this client
 * under," "how many clients does this outlet have") and is freely reassignable afterward (see
 * StoreClientRequest/UpdateClientRequest). A Corporate client isn't tied to any single branch, so
 * it never gets one — outlet_id stays null for those, both on creation and permanently.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->foreignId('outlet_id')->nullable()->after('id')->constrained()->restrictOnDelete();
        });

        $defaultOutletId = DB::table('outlets')->where('code', 'MAIN')->value('id');

        if ($defaultOutletId) {
            DB::table('clients')->whereNull('outlet_id')->where('type', '!=', 'Corporate')->update(['outlet_id' => $defaultOutletId]);
        }
    }

    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropConstrainedForeignId('outlet_id');
        });
    }
};
