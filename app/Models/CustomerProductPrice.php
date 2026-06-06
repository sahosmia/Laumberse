<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomerProductPrice extends Model
{
    protected $fillable = [
        'customer_id',
        'product_id',
        'custom_price',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class, 'customer_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
