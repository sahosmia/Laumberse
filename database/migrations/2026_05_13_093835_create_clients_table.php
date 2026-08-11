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
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('phone');
             $table->enum('type', ['Consumer', 'Corporate', 'B2B'])->default('Consumer');
            $table->string('address')->nullable();
            $table->integer('total_orders')->default(0);
            $table->decimal('total_due', 10, 2)->default(0);
            $table->decimal('total_paid', 10, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
