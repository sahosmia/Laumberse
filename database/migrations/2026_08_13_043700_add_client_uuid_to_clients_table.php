<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->string('client_uuid')->nullable()->unique()->after('id');
        });

        DB::table('clients')->orderBy('id')->select('id')->each(function ($client) {
            DB::table('clients')->where('id', $client->id)->update([
                'client_uuid' => 'CLT-' . str_pad((string) $client->id, 4, '0', STR_PAD_LEFT),
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropColumn('client_uuid');
        });
    }
};
