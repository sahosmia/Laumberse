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
        Schema::create('manage_assets', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('asset_category_id')->nullable()->constrained('asset_categories')->onDelete('set null');
            $table->date('purchase_date');
            $table->decimal('cost', 15, 2);
            $table->text('description')->nullable();
            $table->enum('status', ['Active', 'Maintenance', 'Disposed']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('manage_assets');
    }
};
