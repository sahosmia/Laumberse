<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expense_assets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('expense_id')->constrained()->onDelete('cascade');
            $table->string('serial_number');
            $table->decimal('depreciation', 5, 2); // Percentage
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expense_assets');
    }
};
