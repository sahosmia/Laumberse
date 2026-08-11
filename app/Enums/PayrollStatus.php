<?php

namespace App\Enums;

enum PayrollStatus: string
{
    case Pending = 'pending';
    case Partial = 'partial';
    case Completed = 'completed';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
