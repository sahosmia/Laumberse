<?php

namespace App\Http\Controllers\Finance;

use App\Actions\Reports\GetFinancialPositionAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\StoreAccountRequest;
use App\Http\Requests\Finance\UpdateAccountRequest;
use App\Models\Account;
use App\Services\AccountService;
use App\Support\LedgerQuery;
use App\Support\OutletContext;
use App\Support\PerPage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class AccountController extends Controller
{
    /** value => [column, direction] — whitelisted so the raw `sort` query param never reaches orderBy(). */
    private const SORTABLE = [
        'created_at:desc' => ['created_at', 'desc'],
        'name:asc' => ['name', 'asc'],
        'name:desc' => ['name', 'desc'],
        'current_balance:desc' => ['current_balance', 'desc'],
        'current_balance:asc' => ['current_balance', 'asc'],
    ];

    /** Every action that receives a route-bound Account must call this first — see InvoiceController::ensureAccessible(). */
    private function ensureAccessible(Account $account): void
    {
        if (! OutletContext::canAccess($account->outlet_id)) {
            throw new NotFoundHttpException;
        }
    }

    public function index(Request $request)
    {
        [$sortColumn, $sortDirection] = self::SORTABLE[$request->sort] ?? self::SORTABLE['created_at:desc'];
        $perPage = PerPage::resolve($request);

        $accounts = Account::tap(fn ($q) => OutletContext::scope($q))
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->orderBy($sortColumn, $sortDirection)
            ->orderBy('id', $sortDirection)
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('accounts/index', [
            'accounts' => $accounts,
            // Full, unpaginated list for the Transfer Funds dropdowns — the paginated/filtered
            // `accounts` prop above may not include every account. Scoped the same way: a transfer
            // can only ever move funds between two accounts in the same outlet (see
            // AccountTransferController), so there's no reason to list another outlet's accounts.
            'allAccounts' => Account::tap(fn ($q) => OutletContext::scope($q))->orderBy('name')->get(['id', 'name', 'current_balance']),
            'filters' => [
                'search' => $request->search,
                'sort' => $request->sort,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(StoreAccountRequest $request, AccountService $accountService)
    {
        try {
            $accountService->createAccount($request->validated());

            return redirect()->back()->with('success', 'Account created successfully.');
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to create account.');
        }
    }

    public function update(UpdateAccountRequest $request, Account $account, AccountService $accountService)
    {
        $this->ensureAccessible($account);

        try {
            $accountService->updateAccount($account, $request->validated());

            return redirect()->back()->with('success', 'Account updated successfully.');
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to update account.');
        }
    }

    public function show(Request $request, Account $account)
    {
        $this->ensureAccessible($account);

        // Opening balance is itself recorded as a "credit" transaction (see AccountService::createAccount),
        // so the running total starts at 0 — adding opening_balance again would double-count it.
        //
        // The running-balance window must sum over ALL of this account's transactions regardless
        // of the date filter — otherwise a filtered range would show a running balance that's
        // missing everything before it. So the window function runs in a subquery first, and the
        // date filter is applied as an outer WHERE on top of that, not inside it.
        $withRunningBalance = DB::table('account_transactions')
            ->selectRaw(
                "account_transactions.*, SUM(CASE WHEN type = 'credit' THEN amount ELSE -amount END) OVER (ORDER BY created_at ASC, id ASC) AS running_balance",
            )
            ->where('account_id', $account->id);

        $transactions = LedgerQuery::paginate(
            $withRunningBalance,
            'account_transactions',
            $request,
            orderByDesc: ['created_at', 'id'],
            perPage: 50,
            dateColumn: 'created_at',
        );

        return Inertia::render('accounts/show', [
            'account' => $account,
            'transactions' => $transactions,
            'filters' => [
                'date_filter' => $request->date_filter,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'specific_date' => $request->specific_date,
            ],
        ]);
    }

    public function financialPosition(Request $request, GetFinancialPositionAction $action)
    {
        $asOfDate = $request->validate(['as_of_date' => 'nullable|date_format:Y-m-d'])['as_of_date'] ?? null;

        return Inertia::render('accounts/financial-position', $action($asOfDate));
    }
}
