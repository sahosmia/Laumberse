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
        Schema::create('payrolls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');
            $table->unsignedBigInteger('expense_id')->nullable();
            $table->tinyInteger('month');
            $table->integer('year');
            $table->decimal('base_salary', 15, 2);
            $table->decimal('bonus', 15, 2)->default(0);
            $table->decimal('deduction', 15, 2)->default(0);
            $table->decimal('net_salary', 15, 2);
            $table->decimal('paid_amount', 15, 2)->default(0);
            $table->enum('status', ['pending', 'partial', 'completed'])->default('pending');
            $table->text('deduction_note')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payrolls');
    }
};
