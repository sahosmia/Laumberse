<?php

namespace App\Models;

use App\Enums\PayrollStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payroll extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'expense_id',
        'month',
        'year',
        'base_salary',
        'bonus',
        'deduction',
        'net_salary',
        'paid_amount',
        'status',
        'deduction_note',
        'note',
    ];

    protected function casts(): array
    {
        return [
            'status' => PayrollStatus::class,
        ];
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function expense()
    {
        return $this->belongsTo(Expense::class);
    }
}
