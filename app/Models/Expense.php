<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    protected $fillable = [
        'expense_category_id',
        'payroll_id',
                'manage_asset_id',

        'amount',
        'payment_method',
        'date',
        'description',
    ];

    protected $appends = ['unique_id'];

    public function getUniqueIdAttribute()
    {
        return 'EXP-' . str_pad((string) $this->id, 4, '0', STR_PAD_LEFT);
    }

    public function category()
    {
        return $this->belongsTo(ExpenseCategory::class, 'expense_category_id');
    }

    public function payroll()
    {
        return $this->belongsTo(Payroll::class);
    }
    public function asset()
    {
        return $this->belongsTo(ManageAsset::class, 'manage_asset_id');
    }

      public function materials()
    {
        return $this->hasMany(ExpenseMaterial::class);
    }
}
