<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmployeeTransaction extends Model
{
    protected $fillable = [
        'employee_id',
        'account_id',
        'transaction_type',
        'amount',
        'date',
        'note',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function account()
    {
        return $this->belongsTo(Account::class);
    }
}
