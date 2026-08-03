<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'phone',
        'email',
        'designation',
        'base_salary',
        'is_active',
    ];

    public function payrolls()
    {
        return $this->hasMany(Payroll::class);
    }
}
