<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;

class SqlDateFormat
{
    /** SQL expression grouping a `date` column by month-and-day (e.g. "Aug 08"), portable across SQLite and MySQL. */
    public static function monthDay(string $column = 'date'): string
    {
        return DB::connection()->getDriverName() === 'sqlite'
            ? "strftime('%m-%d', {$column})"
            : "DATE_FORMAT({$column}, '%b %d')";
    }

    /** SQL expression grouping a `date` column by month label (e.g. "Aug"), portable across SQLite and MySQL. */
    public static function monthLabel(string $column = 'date'): string
    {
        return DB::connection()->getDriverName() === 'sqlite'
            ? "strftime('%m', {$column})"
            : "DATE_FORMAT({$column}, '%b')";
    }
}
