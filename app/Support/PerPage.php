<?php

namespace App\Support;

use Illuminate\Http\Request;

/**
 * Resolves the `per_page` query param against the shared whitelist used across every paginated
 * list page — whitelisted so the raw param never lets a client request an unbounded page size.
 */
class PerPage
{
    public const OPTIONS = [20, 50, 100];

    public static function resolve(Request $request, int $default = 50, string $key = 'per_page'): int
    {
        $requested = (int) $request->input($key);

        return in_array($requested, self::OPTIONS, true) ? $requested : $default;
    }
}
