<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\StoreInvestorRequest;
use App\Models\Account;
use App\Models\Investor;
use App\Services\InvestorService;
use App\Support\LedgerQuery;
use App\Support\OutletContext;
use App\Support\PerPage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class InvestorController extends Controller
{
    /** value => [column, direction] — whitelisted so the raw `sort` query param never reaches orderBy(). */
    private const SORTABLE = [
        'created_at:desc' => ['created_at', 'desc'],
        'name:asc' => ['name', 'asc'],
        'name:desc' => ['name', 'desc'],
        'current_balance:desc' => ['current_balance', 'desc'],
        'current_balance:asc' => ['current_balance', 'asc'],
    ];

    public function index(Request $request)
    {
        [$sortColumn, $sortDirection] = self::SORTABLE[$request->sort] ?? self::SORTABLE['created_at:desc'];
        $perPage = PerPage::resolve($request);

        $investors = Investor::when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->orderBy($sortColumn, $sortDirection)
            ->orderBy('id', $sortDirection)
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('investors/index', [
            'investors' => $investors,
            'filters' => [
                'search' => $request->search,
                'sort' => $request->sort,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(StoreInvestorRequest $request, InvestorService $investorService)
    {
        try {
            $investorService->createInvestor($request->validated());

            return redirect()->back()->with('success', 'Investor created successfully.');
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to create investor.');
        }
    }

    public function show(Request $request, Investor $investor)
    {
        // Opening balance is recorded as its own InvestorTransaction row (type 'invest', no
        // account — see InvestorService::createInvestor()), so it's already included in the SUM
        // below like any other row; the running total no longer needs opening_balance as a
        // separate starting offset. The window function must run over ALL of this investor's
        // transactions regardless of the date filter — otherwise a filtered range would show a
        // running balance that's missing everything before it — so it runs in a subquery first,
        // and the date filter (plus the account name/number, since we're no longer in
        // Eloquent-relation land) are applied outside it.
        $withRunningBalance = DB::table('investor_transactions')
            ->leftJoin('accounts', 'accounts.id', '=', 'investor_transactions.account_id')
            ->selectRaw(
                'investor_transactions.*, accounts.name as account_name, accounts.account_number as account_number, '
                ."SUM(CASE WHEN investor_transactions.transaction_type = 'invest' THEN investor_transactions.amount ELSE -investor_transactions.amount END) "
                .'OVER (ORDER BY investor_transactions.date ASC, investor_transactions.id ASC) AS running_balance',
            )
            ->where('investor_transactions.investor_id', $investor->id);

        $transactions = LedgerQuery::paginate(
            $withRunningBalance,
            'investor_transactions',
            $request,
            orderByDesc: ['date', 'id'],
            perPage: 50,
        );

        return Inertia::render('investors/show', [
            'investor' => $investor,
            'transactions' => $transactions,
            'accounts' => Account::tap(fn ($q) => OutletContext::scope($q))->orderBy('name')->get(['id', 'name', 'account_number']),
            'filters' => [
                'date_filter' => $request->date_filter,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'specific_date' => $request->specific_date,
            ],
        ]);
    }
}
