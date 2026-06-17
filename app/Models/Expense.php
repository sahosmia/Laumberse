<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    protected $fillable = [
        'expense_category_id',
        'payroll_id',
        'manage_asset_id',
        'total_amount',
        'payment_method',
        'date',
        'note',
        'outlet_id',
    ];

    public function category()
    {
        return $this->belongsTo(ExpenseCategory::class, 'expense_category_id');
    }

    public function outlet()
    {
        return $this->belongsTo(Outlet::class);
    }

    public function payroll()
    {
        return $this->belongsTo(Payroll::class);
    }
    public function asset()
    {
        return $this->belongsTo(ManageAsset::class, 'manage_asset_id');
    }

    public function expenseSalary()
    {
        return $this->hasOne(ExpenseSalary::class);
    }

    public function expenseAsset()
    {
        return $this->hasOne(ExpenseAsset::class);
    }

    public function materials()
    {
        return $this->hasMany(ExpenseMaterial::class);
    }
}
