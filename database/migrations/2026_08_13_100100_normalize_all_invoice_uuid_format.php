<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * The prior standardize_invoice_uuid_format migration only touched rows whose
     * invoice_uuid didn't already start with "INV-". Demo-seeded invoices already had
     * a random "INV-<date><rand>" value, so that filter skipped them. This migration
     * unconditionally recomputes every invoice_uuid from its id.
     */
    public function up(): void
    {
        DB::table('invoices')->orderBy('id')->select('id')->get()->each(function ($invoice) {
            DB::table('invoices')->where('id', $invoice->id)->update([
                'invoice_uuid' => 'INV-' . str_pad((string) $invoice->id, 4, '0', STR_PAD_LEFT),
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Original random values aren't recoverable; nothing to revert to.
    }
};
