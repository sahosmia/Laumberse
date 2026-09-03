<?php

namespace App\Models;

use App\Enums\ClientType;
use Illuminate\Auth\Authenticatable;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Database\Eloquent\Model;

class Client extends Model implements AuthenticatableContract
{
    use Authenticatable;

    protected $fillable = [
        'client_uuid',
        'outlet_id',
        'username',
        'password',
        'name',
        'phone',
        'type',
        'address',
        'internal_note',
        'total_orders',
        'total_due',
        'total_paid',
    ];

    // Staff-only — must never reach the client portal. Hidden by default; staff-facing
    // controllers explicitly makeVisible() it where it's actually shown.
    protected $hidden = [
        'password',
        'remember_token',
        'internal_note',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'type' => ClientType::class,
        ];
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    /** Null for a Corporate client — see the outlet_id migration docblock. */
    public function outlet()
    {
        return $this->belongsTo(Outlet::class);
    }

    public function customPrices()
    {
        return $this->hasMany(CustomerProductPrice::class, 'customer_id');
    }

    public function activities()
    {
        return $this->hasMany(ClientActivity::class);
    }

    public function hasPortalAccess(): bool
    {
        return ! empty($this->username) && ! empty($this->password);
    }
}
