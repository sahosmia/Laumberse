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
    /** Only ever set via InvoiceService::cancelOrder() — see formValues()'s exclusion below. */
    case BadOrder = 'Bad Order';

    /**
     * Statuses settable directly through the invoice create/edit form or the inline status
     * dropdown — everything except BadOrder, which is reachable only through the dedicated
     * "Cancel Order" action (it has money/payment_status side effects a plain status edit must
     * never trigger as a side door).
     */
    public static function formValues(): array
    {
        return array_values(array_filter(self::values(), fn ($value) => $value !== self::BadOrder->value));
    }

    /** Every valid status value, including BadOrder (for display/casting — not form-settable, see formValues()). */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
