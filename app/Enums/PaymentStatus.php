<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case Paid = 'Paid';
    case Unpaid = 'Unpaid';
    /** Only ever set via InvoiceService::cancelOrder() — never through the plain Paid/Unpaid toggle. */
    case Cancelled = 'Cancelled';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
