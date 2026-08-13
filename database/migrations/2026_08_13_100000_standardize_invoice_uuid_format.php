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
        DB::table('invoices')
            ->where('invoice_uuid', 'not like', 'INV-%')
            ->orderBy('id')
            ->select('id', 'invoice_uuid')
            ->get()
            ->each(function ($invoice) {
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
        DB::table('invoices')
            ->where('invoice_uuid', 'like', 'INV-%')
            ->orderBy('id')
            ->select('id')
            ->get()
            ->each(function ($invoice) {
                DB::table('invoices')->where('id', $invoice->id)->update([
                    'invoice_uuid' => str_pad((string) $invoice->id, 4, '0', STR_PAD_LEFT),
                ]);
            });
    }
};
