<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ManageAsset extends Model
{
    protected $fillable = [
        'name',
        'description',
        'purchase_date',
        'cost',
        'status',
        'asset_category_id',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(AssetCategory::class, 'asset_category_id');
    }
     public function expense(): HasOne
    {
        return $this->hasOne(Expense::class, 'manage_asset_id');
    }
}
