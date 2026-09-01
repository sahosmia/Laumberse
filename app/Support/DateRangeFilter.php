<?php

namespace App\Support;

use App\Models\GlobalSetting;
use Illuminate\Contracts\Database\Query\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

/**
 * Applies the shared "date_filter" preset (today/yesterday/this_week/previous_week/
 * specific_date/custom) used across list pages such as Invoice History and Expenses.
 *
 * Typed against the shared query-builder contract (not the Eloquent-specific Builder) so it
 * works on both Eloquent queries and plain query-builder instances — the Account ledger applies
 * it to a `DB::query()->fromSub(...)` result, not an Eloquent model query.
 *
 * Pass `$prefix` when a single page has more than one independently filterable list (e.g. a
 * client's Order History and Meetings sections) — it reads `{prefix}_date_filter` etc instead
 * of the bare `date_filter` so the two lists don't fight over the same query params.
 */
class DateRangeFilter
{
    public static function apply(Builder $query, Request $request, string $column = 'date', ?string $prefix = null): Builder
    {
        $key = fn (string $name): string => $prefix ? "{$prefix}_{$name}" : $name;

        $dateFilter = $request->input($key('date_filter'));

        if (!$dateFilter) {
            return $query;
        }

        $today = today();

        switch ($dateFilter) {
            case 'today':
                $query->whereDate($column, $today);
                break;
            case 'yesterday':
                $query->whereDate($column, $today->copy()->subDay());
                break;
            case 'this_week':
                $query->whereBetween($column, [
                    $today->copy()->startOfWeek(self::weekStartDay())->toDateString(),
                    $today->copy()->endOfWeek(self::weekStartDay())->toDateString(),
                ]);
                break;
            case 'previous_week':
                $startOfPreviousWeek = $today->copy()->startOfWeek(self::weekStartDay())->subWeek();
                $query->whereBetween($column, [
                    $startOfPreviousWeek->toDateString(),
                    $startOfPreviousWeek->copy()->addDays(6)->toDateString(),
                ]);
                break;
            case 'specific_date':
                $specificDate = $request->input($key('specific_date'));
                if ($specificDate) {
                    $query->whereDate($column, $specificDate);
                }
                break;
            case 'custom':
                $startDate = $request->input($key('start_date'));
                $endDate = $request->input($key('end_date'));
                if ($startDate && $endDate) {
                    $query->whereBetween($column, [$startDate, $endDate]);
                } elseif ($startDate) {
                    $query->whereBetween($column, [$startDate, $today->toDateString()]);
                } elseif ($endDate) {
                    $query->whereDate($column, '<=', $endDate);
                }
                break;
        }

        return $query;
    }

    /** The business week's start day (0=Sunday..6=Saturday), configurable via Global Settings. Defaults to Saturday. */
    private static function weekStartDay(): int
    {
        return (int) GlobalSetting::get('week_start_day', Carbon::SATURDAY);
    }
}
