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
    ];

    protected static function booted()
    {
        static::creating(function ($invoice) {
            if (empty($invoice->invoice_uuid) || str_starts_with($invoice->invoice_uuid, 'INV-')) {
                $invoice->invoice_uuid = 'temp_' . uniqid();
            }
        });

        static::created(function ($invoice) {
            $invoice->invoice_uuid = str_pad($invoice->id, 4, '0', STR_PAD_LEFT);
            $invoice->saveQuietly();
        });
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
