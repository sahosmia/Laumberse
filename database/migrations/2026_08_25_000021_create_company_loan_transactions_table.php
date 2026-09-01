<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('company_loan_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_loan_id')->constrained()->cascadeOnDelete();
            // Nullable: 'interest' accrues on the loan only and never touches a payment account.
            $table->foreignId('account_id')->nullable()->constrained()->restrictOnDelete();
            $table->enum('transaction_type', ['loan', 'repay', 'interest']);
            $table->decimal('amount', 15, 2);
            $table->date('date');
            $table->text('note')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('company_loan_transactions');
    }
};
