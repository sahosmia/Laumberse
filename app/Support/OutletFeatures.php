<?php

namespace App\Support;

/**
 * Registry of outlet-toggleable features — the single place a module registers itself so it shows
 * up in the Outlet create/edit form's Feature Availability list and can be enabled/disabled per
 * outlet (see Outlet::hasFeature() / OutletContext::featureEnabledFor()). Adding a future module
 * only means adding an entry here plus the gating check at its own write path — no schema change,
 * since Outlet.disabled_features stores keys, not a fixed set of columns.
 *
 * Split into named groups (rather than one flat list) because two different write paths each need
 * to validate against *their own* subset only — StoreClientActivityRequest must never accept a
 * client type as an activity `type`, and vice versa. ALL is what Outlet::disabled_features itself
 * validates against and what the Outlet form's checklist renders, since any key from any group is
 * a legal thing to disable.
 */
class OutletFeatures
{
    /** ClientActivity types this outlet can log — see StoreClientActivityRequest. */
    public const ACTIVITIES = [
        'meeting' => 'Meetings',
        'follow_up' => 'Follow-ups',
    ];

    /** Client types (App\Enums\ClientType) this outlet can create new clients as — see StoreClientRequest. */
    public const CLIENT_TYPES = [
        'Consumer' => 'Consumer Clients',
        'Corporate' => 'Corporate Clients',
        'B2B' => 'B2B Clients',
    ];

    public const ALL = self::ACTIVITIES + self::CLIENT_TYPES;
}
