<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanyLoanTransaction extends Model
{
    protected $fillable = [
        'company_loan_id',
        'account_id',
        'outlet_id',
        'transaction_type',
        'amount',
        'date',
        'note',
    ];

    public function companyLoan()
    {
        return $this->belongsTo(CompanyLoan::class);
    }

    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    public function outlet()
    {
        return $this->belongsTo(Outlet::class);
    }
}
