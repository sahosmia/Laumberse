<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OutletProductPrice extends Model
{
    protected $fillable = [
        'outlet_id',
        'product_id',
        'price',
    ];

    public function outlet()
    {
        return $this->belongsTo(Outlet::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
