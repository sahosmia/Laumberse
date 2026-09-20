<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('outlets', function (Blueprint $table) {
            // Whether this outlet's data is folded into the "All Outlets" consolidated view — see
            // App\Support\OutletContext::scope(). Off for an outlet that must report standalone only.
            $table->boolean('include_in_consolidated_reporting')->default(true);
            // Feature keys (see App\Support\OutletFeatures) turned off for this outlet. Absence from
            // the array means enabled — so a new feature is enabled everywhere by default and needs
            // no backfill when it's registered.
            $table->json('disabled_features')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('outlets', function (Blueprint $table) {
            $table->dropColumn(['include_in_consolidated_reporting', 'disabled_features']);
        });
    }
};
