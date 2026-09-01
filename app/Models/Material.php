<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Material extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'unit_id'];

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function expenseMaterials()
    {
        return $this->hasMany(ExpenseMaterial::class);
    }
}
