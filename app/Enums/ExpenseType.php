<?php

namespace App\Enums;

enum ExpenseType: string
{
    case General = 'general';
    case Salary = 'salary';
    case Material = 'material';
    case Asset = 'asset';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
