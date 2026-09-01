<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'outlet_id',
        'employee_id',
        'name',
        'phone',
        'email',
        'designation',
        'base_salary',
        'opening_balance',
        'current_balance',
        'is_active',
    ];

    protected static function booted(): void
    {
        static::creating(function (Employee $employee) {
            if (empty($employee->employee_id)) {
                $employee->employee_id = self::generateEmployeeId();
            }

            $employee->opening_balance = $employee->opening_balance ?? 0;
            $employee->current_balance = $employee->opening_balance;

            // EmployeeController::store() always resolves outlet_id explicitly via
            // OutletContext::resolveForWrite() before this fires, so this only ever applies to an
            // Employee created directly (bypassing the controller) without one.
            $employee->outlet_id ??= Outlet::query()->oldest('id')->value('id');
        });
    }

    public function outlet()
    {
        return $this->belongsTo(Outlet::class);
    }

    public function payrolls()
    {
        return $this->hasMany(Payroll::class);
    }

    public function transactions()
    {
        return $this->hasMany(EmployeeTransaction::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public static function generateEmployeeId(): string
    {
        $lastNumber = self::query()
            ->where('employee_id', 'like', 'EMP-%')
            ->pluck('employee_id')
            ->map(fn (string $id) => (int) substr($id, 4))
            ->max();

        do {
            $lastNumber = ($lastNumber ?? 0) + 1;
            $candidate = 'EMP-'.str_pad((string) $lastNumber, 4, '0', STR_PAD_LEFT);
        } while (self::where('employee_id', $candidate)->exists());

        return $candidate;
    }
}
