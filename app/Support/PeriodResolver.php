<?php

namespace App\Support;

class PeriodResolver
{
    /**
     * Resolves a named period (today/this_month/last_month/this_year/custom) into a concrete
     * [period, from, to] date range. Defaults to 'this_month' when nothing is specified, and to
     * 'custom' when a from/to was given without naming a period explicitly. Shared by the
     * Dashboard and Reports pages, which use the exact same period vocabulary.
     */
    public static function resolve(?string $period, ?string $from, ?string $to): array
    {
        $period = $period ?: (($from || $to) ? 'custom' : 'this_month');

        [$resolvedFrom, $resolvedTo] = match ($period) {
            'today' => [now()->toDateString(), now()->toDateString()],
            'this_month' => [now()->startOfMonth()->toDateString(), now()->endOfMonth()->toDateString()],
            'last_month' => [now()->subMonthNoOverflow()->startOfMonth()->toDateString(), now()->subMonthNoOverflow()->endOfMonth()->toDateString()],
            'this_year' => [now()->startOfYear()->toDateString(), now()->endOfYear()->toDateString()],
            default => [$from, $to],
        };

        return [$period, $resolvedFrom, $resolvedTo];
    }
}
