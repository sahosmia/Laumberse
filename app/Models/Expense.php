<?php

namespace App\Models;

use App\Enums\ExpenseType;
use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    protected $fillable = [
        'outlet_id',
        'expense_category_id',
        'account_id',
        'payroll_id',
        'asset_id',
        'type',

        'amount',
        'payment_method',
        'date',
        'description',
    ];

    protected $appends = ['unique_id'];

    protected function casts(): array
    {
        return [
            'type' => ExpenseType::class,
        ];
    }

    protected static function booted(): void
    {
        // ExpenseService::storeExpense() always resolves outlet_id explicitly via
        // OutletContext::resolveForWrite() before this fires, so this only ever applies to an
        // Expense created directly (bypassing the service) without one.
        static::creating(function (Expense $expense) {
            $expense->outlet_id ??= Outlet::query()->oldest('id')->value('id');
        });
    }

    public function getUniqueIdAttribute()
    {
        return 'EXP-'.str_pad((string) $this->id, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Single source of truth for classifying an expense's sub-type. Replaces the GlobalSetting
     * id comparisons that used to be duplicated across the form request and service layers —
     * and, once stored on the row via `type`, stops those comparisons from silently reclassifying
     * historical expenses if the salary/material category settings are changed later.
     */
    public static function classifyType(?int $categoryId, bool $isAssetPurchase = false): ExpenseType
    {
        if ($isAssetPurchase) {
            return ExpenseType::Asset;
        }

        if ($categoryId !== null) {
            if ((string) $categoryId === (string) GlobalSetting::get('salary_category_id')) {
                return ExpenseType::Salary;
            }

            if ((string) $categoryId === (string) GlobalSetting::get('material_expense_category_id')) {
                return ExpenseType::Material;
            }
        }

        return ExpenseType::General;
    }

    public function outlet()
    {
        return $this->belongsTo(Outlet::class);
    }

    public function category()
    {
        return $this->belongsTo(ExpenseCategory::class, 'expense_category_id');
    }

    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    public function payroll()
    {
        return $this->belongsTo(Payroll::class);
    }

    public function asset()
    {
        return $this->belongsTo(Asset::class, 'asset_id');
    }

    public function materials()
    {
        return $this->hasMany(ExpenseMaterial::class);
    }
}
