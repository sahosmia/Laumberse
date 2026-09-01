<?php

namespace App\Enums;

enum InvoiceStatus: string
{
    case Pending = 'Pending';
    case Processing = 'Processing';
    case InHouse = 'In House';
    case Delivered = 'Delivered';
    case Cancelled = 'Cancelled';

    /** Statuses settable directly through the invoice create/edit form. */
    public static function formValues(): array
    {
        return [self::Processing->value, self::InHouse->value, self::Delivered->value, self::Cancelled->value];
    }

    /** Statuses settable through the dedicated inline status-update action. */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
