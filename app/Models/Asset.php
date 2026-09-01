<?php

namespace App\Models;

use App\Enums\AssetStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Asset extends Model
{
    protected $fillable = [
        'outlet_id',
        'name',
        'description',
        'purchase_date',
        'cost',
        'status',
        'asset_category_id',
    ];

    protected function casts(): array
    {
        return [
            'status' => AssetStatus::class,
        ];
    }

    protected static function booted(): void
    {
        // CreateAssetAction always resolves outlet_id explicitly via
        // OutletContext::resolveForWrite() before this fires, so this only ever applies to an
        // Asset created directly (bypassing the action) without one.
        static::creating(function (Asset $asset) {
            $asset->outlet_id ??= Outlet::query()->oldest('id')->value('id');
        });
    }

    public function outlet(): BelongsTo
    {
        return $this->belongsTo(Outlet::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(AssetCategory::class, 'asset_category_id');
    }

    public function expense(): HasOne
    {
        return $this->hasOne(Expense::class, 'asset_id');
    }

    /** Disposed assets are no longer owned, so they're excluded from current asset value/listings. */
    public function scopeNotDisposed(Builder $query): Builder
    {
        return $query->where('status', '!=', AssetStatus::Disposed->value);
    }
}
