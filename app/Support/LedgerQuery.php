<?php

namespace App\Support;

use Illuminate\Contracts\Database\Query\Builder;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Wraps an already-built running-balance window-function query into the paginated, date-filtered
 * result every ledger "show" page (Account, Investor, Company Loan, Employee) returns.
 *
 * Deliberately narrow: it knows nothing about which table(s) a ledger reads from, how its running
 * balance is calculated, or whether it needs an opening-balance constant — that's business logic,
 * and it's genuinely different per ledger (see the P1.2 analysis: a 2-way credit/debit split for
 * Account, an inverted 2-way split for Company Loan, a 3-way split with a zero-contribution branch
 * for Employee's merged salary rows, etc.). All of that stays in each controller. This class only
 * does the mechanical part every one of them repeats identically once the window query already
 * exists:
 *
 *   fromSub($windowQuery) -> DateRangeFilter::apply() -> orderByDesc(...) -> paginate() -> withQueryString()
 *
 * `$windowQuery` MUST already compute its running balance over the ledger's *entire*, unfiltered
 * history — this class applies the date filter only in the outer query it builds, never inside
 * `$windowQuery` itself. Filtering inside the window subquery would truncate the running-balance
 * SUM for anything but an unfiltered view, silently producing a wrong balance for any date-filtered
 * page load. This is exactly why every one of the four ledgers already built it this way by hand.
 */
class LedgerQuery
{
    /**
     * @param  Builder  $windowQuery  The already-built query computing `running_balance` via a SQL
     *                                window function, over the ledger's complete, unfiltered history.
     * @param  string  $alias  Subquery alias for `fromSub()`.
     * @param  string  $dateColumn  Column `DateRangeFilter` filters/compares against — pass
     *                              'created_at' for a ledger with no `date` column of its own (only
     *                              Account, whose source table has no `date` column at all).
     * @param  string[]  $orderByDesc  Columns to sort by, descending, in priority order (e.g.
     *                                 ['date', 'created_at', 'id'] for a merged/unioned ledger where
     *                                 `id` alone isn't a reliable tie-break across sources).
     */
    public static function paginate(
        Builder $windowQuery,
        string $alias,
        Request $request,
        array $orderByDesc,
        int $perPage,
        string $dateColumn = 'date',
    ): LengthAwarePaginator {
        $query = DB::query()->fromSub($windowQuery, $alias)
            ->tap(fn ($q) => DateRangeFilter::apply($q, $request, $dateColumn));

        foreach ($orderByDesc as $column) {
            $query->orderByDesc($column);
        }

        return $query->paginate($perPage)->withQueryString();
    }
}
