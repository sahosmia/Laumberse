<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('investor_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('investor_id')->constrained()->cascadeOnDelete();
            // Nullable so an Investor's opening balance can be recorded as a real ledger row (type
            // 'invest', no account) instead of only living as a starting offset with no visible entry.
            $table->foreignId('account_id')->nullable()->constrained()->restrictOnDelete();
            $table->enum('transaction_type', ['invest', 'withdraw']);
            $table->decimal('amount', 15, 2);
            $table->date('date');
            $table->text('note')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('investor_transactions');
    }
};
