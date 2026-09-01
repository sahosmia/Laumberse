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
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_uuid')->unique();
            $table->date('date');
            $table->foreignId('client_id')->constrained()->onDelete('cascade');
            // Nullable: an invoice created as fully unpaid doesn't need a payment account yet.
            $table->foreignId('account_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('discount_type', ['Fixed', 'Percentage'])->default('Fixed');
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->decimal('delivery_charge', 10, 2)->default(0.00);
            $table->decimal('total', 10, 2);
            $table->decimal('paid', 10, 2);
            $table->decimal('due', 10, 2);
            $table->enum('payment_status', ['Paid', 'Unpaid'])->default('Unpaid');
            $table->date('payment_date')->nullable();
            $table->enum('status', ['Pending', 'Processing', 'In House', 'Delivered', 'Cancelled']);
            $table->string('method');
            // Client-facing, printed on the invoice/PDF — distinct from `internal_note`, which is staff-only.
            $table->text('remarks')->nullable();
            $table->text('internal_note')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
