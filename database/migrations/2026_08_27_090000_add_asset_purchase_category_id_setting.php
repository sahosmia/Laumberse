<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Backfill from the "Asset Purchase" category CreateAssetAction used to auto-create by
        // name, so existing installs keep working once that lookup switches to this setting.
        $assetCategoryId = DB::table('expense_categories')->where('name', 'Asset Purchase')->value('id');

        if ($assetCategoryId !== null) {
            DB::table('global_settings')->updateOrInsert(
                ['key' => 'asset_purchase_category_id'],
                ['value' => $assetCategoryId]
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('global_settings')->where('key', 'asset_purchase_category_id')->delete();
    }
};
