<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanyLoan extends Model
{
    protected $fillable = [
        'lender_name',
        'initial_loan_amount',
        'current_balance',
    ];

    public function transactions()
    {
        return $this->hasMany(CompanyLoanTransaction::class);
    }
}
