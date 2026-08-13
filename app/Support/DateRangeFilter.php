<?php

namespace App\Support;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

/**
 * Applies the shared "date_filter" preset (today/yesterday/this_month/last_month/
 * last_3_months/this_year/last_year/custom) used across list pages such as
 * Invoice History and Expenses.
 */
class DateRangeFilter
{
    public static function apply(Builder $query, Request $request, string $column = 'date'): Builder
    {
        if (!$request->date_filter) {
            return $query;
        }

        $today = today();

        switch ($request->date_filter) {
            case 'today':
                $query->whereDate($column, $today);
                break;
            case 'yesterday':
                $query->whereDate($column, $today->copy()->subDay());
                break;
            case 'this_month':
                $query->whereYear($column, $today->year)->whereMonth($column, $today->month);
                break;
            case 'last_month':
                $lastMonth = $today->copy()->subMonthNoOverflow();
                $query->whereYear($column, $lastMonth->year)->whereMonth($column, $lastMonth->month);
                break;
            case 'last_3_months':
                $query->whereBetween($column, [$today->copy()->subMonths(3)->addDay()->toDateString(), $today->toDateString()]);
                break;
            case 'this_year':
                $query->whereYear($column, $today->year);
                break;
            case 'last_year':
                $query->whereYear($column, $today->year - 1);
                break;
            case 'custom':
                if ($request->start_date && $request->end_date) {
                    $query->whereBetween($column, [$request->start_date, $request->end_date]);
                } elseif ($request->start_date) {
                    $query->whereBetween($column, [$request->start_date, $today->toDateString()]);
                } elseif ($request->end_date) {
                    $query->whereDate($column, '<=', $request->end_date);
                }
                break;
        }

        return $query;
    }
}
