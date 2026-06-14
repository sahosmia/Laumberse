<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExpenseMaterial extends Model
{
    use HasFactory;

    protected $fillable = [
        'expense_id',
        'material_id',
        'quantity',
        'unit_price',
        'amount',
    ];

    public function expense()
    {
        return $this->belongsTo(Expense::class);
    }

    public function material()
    {
        return $this->belongsTo(Material::class);
    }
}
