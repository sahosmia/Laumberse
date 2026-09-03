<?php

namespace App\Enums;

enum InvoiceStatus: string
{
    case InHouse = 'In House';
    case PreWash = 'Pre Wash';
    case Washing = 'Washing';
    case Extract = 'Extract';
    case Drying = 'Drying';
    case Pressing = 'Pressing';
    case Ready = 'Ready';
    case Delivered = 'Delivered';
    case Cancelled = 'Cancelled';

    /** Statuses settable directly through the invoice create/edit form. */
    public static function formValues(): array
    {
        return self::values();
    }

    /** Statuses settable through the dedicated inline status-update action. */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
