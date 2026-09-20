<?php

namespace App\Support;

use App\Models\GlobalSetting;
use App\Models\Outlet;

/**
 * Resolves the business details shown on invoices (PDF, POS receipt, and the on-screen invoice
 * page) — each outlet's own address/phone take precedence over the shared GlobalSetting values,
 * so every branch prints its own contact details instead of one shared head-office number.
 */
class BusinessInfo
{
    public static function name(): string
    {
        return GlobalSetting::get('business_name') ?: 'Launverse';
    }

    public static function address(?Outlet $outlet): ?string
    {
        return $outlet?->address ?: GlobalSetting::get('business_address');
    }

    public static function phone(?Outlet $outlet): ?string
    {
        return $outlet?->phone ?: GlobalSetting::get('business_phone');
    }

    public static function logoUrl(): ?string
    {
        $logoPath = GlobalSetting::get('logo_path');

        return $logoPath ? asset('storage/'.$logoPath) : null;
    }
}
