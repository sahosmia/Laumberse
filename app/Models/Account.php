<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Account extends Model
{
    protected $fillable = [
        'outlet_id',
        'name',
        'account_number',
        'opening_balance',
        'current_balance',
    ];

    protected static function booted(): void
    {
        // AccountService::createAccount() always resolves outlet_id explicitly via
        // OutletContext::resolveForWrite() before this fires, so this only ever applies to an
        // Account created directly (bypassing the service) without one — used extensively across
        // the test suite as a plain fixture.
        static::creating(function (Account $account) {
            $account->outlet_id ??= Outlet::query()->oldest('id')->value('id');
        });
    }

    public function outlet()
    {
        return $this->belongsTo(Outlet::class);
    }

    public function transactions()
    {
        return $this->hasMany(AccountTransaction::class);
    }
}
