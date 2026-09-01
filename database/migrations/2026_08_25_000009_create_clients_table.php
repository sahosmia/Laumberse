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
            $table->string('client_uuid')->nullable()->unique();
            // Both nullable: portal login is optional per client, set by an admin at creation/edit time.
            $table->string('username')->nullable()->unique();
            $table->string('password')->nullable();
            $table->rememberToken();
            $table->string('name');
            $table->string('phone');
            $table->enum('type', ['Consumer', 'Corporate', 'B2B'])->default('Consumer');
            $table->string('address')->nullable();
            // Staff-only — never shown to the client (portal pages) or on any client-facing document.
            $table->text('internal_note')->nullable();
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
