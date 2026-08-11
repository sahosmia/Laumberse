<?php

namespace App\Enums;

enum DiscountType: string
{
    case Fixed = 'Fixed';
    case Percentage = 'Percentage';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
