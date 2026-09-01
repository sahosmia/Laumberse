<?php

namespace App\Models;

use App\Enums\DiscountType;
use App\Enums\InvoiceStatus;
use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    protected $fillable = [
        'invoice_uuid',
        'outlet_id',
        'date',
        'client_id',
        'account_id',
        'total',
        'paid',
        'due',
        'status',
        'method',
        'remarks',
        'internal_note',
        'discount_type',
        'discount_amount',
        'delivery_charge',
        'payment_status',
        'payment_date',
    ];

    // Staff-only — unlike `remarks`, this must never reach the client portal or the PDF. Hidden
    // by default; staff-facing controllers explicitly makeVisible() it where it's actually shown.
    protected $hidden = ['internal_note'];

    protected static function booted(): void
    {
        // InvoiceService::createInvoice() always resolves outlet_id explicitly via
        // OutletContext::resolveForWrite() before this fires, so this only ever applies to an
        // Invoice created directly (bypassing the service) without one — same safety-net role as
        // UserFactory::definition() defaulting to the first outlet.
        static::creating(function (Invoice $invoice) {
            $invoice->outlet_id ??= Outlet::query()->oldest('id')->value('id');
        });
    }

    protected function casts(): array
    {
        return [
            'status' => InvoiceStatus::class,
            'payment_status' => PaymentStatus::class,
            'discount_type' => DiscountType::class,
        ];
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function outlet()
    {
        return $this->belongsTo(Outlet::class);
    }

    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    public function items()
    {
        return $this->hasMany(InvoiceItem::class);
    }

    public function histories()
    {
        return $this->hasMany(InvoiceHistory::class)->latest();
    }
}
