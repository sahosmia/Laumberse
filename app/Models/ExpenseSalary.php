<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExpenseSalary extends Model
{
    protected $fillable = [
        'expense_id',
        'employee_id',
        'month',
        'year',
        'bonus',
        'deduction',
        'deduction_note',
    ];

    public function expense(): BelongsTo
    {
        return $this->belongsTo(Expense::class);
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
