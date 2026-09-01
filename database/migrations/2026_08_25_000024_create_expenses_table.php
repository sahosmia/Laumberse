<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('expense_category_id')->constrained()->onDelete('cascade');
            // Nullable: historical expenses were recorded against a free-text payment_method,
            // not a real account, and have no account_id to backfill.
            $table->foreignId('account_id')->nullable()->constrained()->restrictOnDelete();
            $table->foreignId('payroll_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('asset_id')->nullable()->constrained('assets')->onDelete('set null');
            $table->enum('type', ['general', 'salary', 'material', 'asset'])->default('general');
            $table->decimal('amount', 15, 2);
            $table->string('payment_method')->nullable();
            $table->date('date');
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
