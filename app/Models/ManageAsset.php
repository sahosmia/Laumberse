<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ManageAsset extends Model
{
    protected $fillable = [
        'name',
        'code',
        'purchase_date',
        'cost',
        'current_value',
        'depreciation_rate',
        'status',
    ];
}
