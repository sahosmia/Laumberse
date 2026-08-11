<?php

namespace App\Enums;

enum AssetStatus: string
{
    case Active = 'Active';
    case Maintenance = 'Maintenance';
    case Disposed = 'Disposed';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
