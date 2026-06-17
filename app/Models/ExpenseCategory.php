<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExpenseCategory extends Model
{
    const TYPE_GENERAL = 'general';
    const TYPE_MATERIAL = 'material';
    const TYPE_ASSET = 'asset';
    const TYPE_SALARY = 'salary';

    protected $fillable = [
        'name',
        'description',
        'type',
    ];

    public function expenses()
    {
        return $this->hasMany(Expense::class);
    }
}
