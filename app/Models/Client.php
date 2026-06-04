<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    protected $fillable = [
        'name',
        'phone',
        'type',
        'address',
        'total_orders',
        'total_due',
        'total_paid',
    ];

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    public function customPrices()
    {
        return $this->hasMany(CustomerProductPrice::class, 'customer_id');
    }
}
