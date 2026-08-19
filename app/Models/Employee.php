<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'name',
        'phone',
        'email',
        'designation',
        'base_salary',
        'is_active',
    ];

    protected static function booted(): void
    {
        static::creating(function (Employee $employee) {
            if (empty($employee->employee_id)) {
                $employee->employee_id = self::generateEmployeeId();
            }
        });
    }

    public function payrolls()
    {
        return $this->hasMany(Payroll::class);
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
