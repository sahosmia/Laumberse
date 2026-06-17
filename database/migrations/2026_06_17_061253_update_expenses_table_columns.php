<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->renameColumn('amount', 'total_amount');
            $table->renameColumn('description', 'note');
        });
    }

    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->renameColumn('total_amount', 'amount');
            $table->renameColumn('note', 'description');
        });
    }
};
