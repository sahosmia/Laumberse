<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('manage_assets', function (Blueprint $table) {
            $table->dropUnique(['code']);
        });

        Schema::table('manage_assets', function (Blueprint $table) {
            $table->dropColumn(['code', 'current_value', 'depreciation_rate']);
            $table->text('description')->nullable()->after('name');
            $table->foreignId('asset_category_id')->nullable()->after('status')->constrained('asset_categories')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('manage_assets', function (Blueprint $table) {
            $table->string('code')->unique()->after('name');
            $table->decimal('current_value', 15, 2)->after('cost');
            $table->decimal('depreciation_rate', 5, 2)->nullable()->after('current_value');
            $table->dropForeign(['asset_category_id']);
            $table->dropColumn(['description', 'asset_category_id']);
        });
    }
};
