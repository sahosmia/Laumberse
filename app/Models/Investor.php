<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Investor extends Model
{
    protected $fillable = [
        'name',
        'phone',
        'opening_balance',
        'current_balance',
    ];

    public function transactions()
    {
        return $this->hasMany(InvestorTransaction::class);
    }
}
