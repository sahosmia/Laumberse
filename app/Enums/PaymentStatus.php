<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case Paid = 'Paid';
    case Unpaid = 'Unpaid';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
