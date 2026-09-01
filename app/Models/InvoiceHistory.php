<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InvoiceHistory extends Model
{
    protected $fillable = [
        'invoice_id',
        'user_id',
        'action',
        'changes',
    ];

    protected function casts(): array
    {
        return [
            'changes' => 'array',
        ];
    }

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
