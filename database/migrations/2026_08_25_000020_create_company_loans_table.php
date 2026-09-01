<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('company_loans', function (Blueprint $table) {
            $table->id();
            $table->string('lender_name');
            $table->decimal('initial_loan_amount', 15, 2);
            $table->decimal('current_balance', 15, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('company_loans');
    }
};
