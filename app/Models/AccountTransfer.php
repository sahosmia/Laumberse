<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AccountTransfer extends Model
{
    protected $fillable = [
        'from_account_id',
        'to_account_id',
        'amount',
        'date',
        'note',
        'user_id',
    ];

    public function fromAccount()
    {
        return $this->belongsTo(Account::class, 'from_account_id');
    }

    public function toAccount()
    {
        return $this->belongsTo(Account::class, 'to_account_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
