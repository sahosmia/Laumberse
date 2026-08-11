<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    protected $fillable = [
        'invoice_uuid',
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
        'payment_status',
        'payment_date',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function items()
    {
        return $this->hasMany(InvoiceItem::class);
    }
}
