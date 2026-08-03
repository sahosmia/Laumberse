<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    protected $fillable = [
        'invoice_uuid',
        'outlet_id',
        'date',
        'client_id',
        'total',
        'paid',
        'due',
        'status',
        'method',
        'remarks',
        'discount_type',
        'discount_amount',
        'delivery_charge',
    ];

    public function outlet()
    {
        return $this->belongsTo(Outlet::class);
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function items()
    {
        return $this->hasMany(InvoiceItem::class);
    }
}
