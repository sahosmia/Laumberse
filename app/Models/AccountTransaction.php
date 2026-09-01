<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AccountTransaction extends Model
{
    protected $fillable = [
        'account_id',
        'type',
        'amount',
        'description',
        'reference_id',
        'reference_type',
    ];

    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    public function reference()
    {
        return $this->morphTo();
    }
}
