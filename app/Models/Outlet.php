<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Outlet extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'address',
        'phone',
        'email',
        'status',
        'include_in_consolidated_reporting',
        'disabled_features',
    ];

    protected $casts = [
        'include_in_consolidated_reporting' => 'boolean',
        'disabled_features' => 'array',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /** Whether $feature (see App\Support\OutletFeatures) is turned on for this outlet. */
    public function hasFeature(string $feature): bool
    {
        return ! in_array($feature, $this->disabled_features ?? [], true);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }
}
