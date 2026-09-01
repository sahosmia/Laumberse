<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InvestorTransaction extends Model
{
    protected $fillable = [
        'investor_id',
        'account_id',
        'outlet_id',
        'transaction_type',
        'amount',
        'date',
        'note',
    ];

    public function investor()
    {
        return $this->belongsTo(Investor::class);
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
