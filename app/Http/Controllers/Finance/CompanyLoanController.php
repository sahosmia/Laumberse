<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\StoreCompanyLoanRequest;
use App\Models\Account;
use App\Models\CompanyLoan;
use App\Services\CompanyLoanService;
use App\Support\LedgerQuery;
use App\Support\OutletContext;
use App\Support\PerPage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CompanyLoanController extends Controller
{
    /** value => [column, direction] — whitelisted so the raw `sort` query param never reaches orderBy(). */
    private const SORTABLE = [
        'created_at:desc' => ['created_at', 'desc'],
        'lender_name:asc' => ['lender_name', 'asc'],
        'lender_name:desc' => ['lender_name', 'desc'],
        'current_balance:desc' => ['current_balance', 'desc'],
        'current_balance:asc' => ['current_balance', 'asc'],
    ];

    public function index(Request $request)
    {
        [$sortColumn, $sortDirection] = self::SORTABLE[$request->sort] ?? self::SORTABLE['created_at:desc'];
        $perPage = PerPage::resolve($request);

        $companyLoans = CompanyLoan::when($request->search, fn ($q, $s) => $q->where('lender_name', 'like', "%{$s}%"))
            ->orderBy($sortColumn, $sortDirection)
            ->orderBy('id', $sortDirection)
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('company-loans/index', [
            'companyLoans' => $companyLoans,
            'filters' => [
                'search' => $request->search,
                'sort' => $request->sort,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(StoreCompanyLoanRequest $request, CompanyLoanService $companyLoanService)
    {
        try {
            $companyLoanService->createLoan($request->validated());

            return redirect()->back()->with('success', 'Company loan created successfully.');
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to create company loan.');
        }
    }

    public function show(Request $request, CompanyLoan $companyLoan)
    {
        // Initial loan amount has no CompanyLoanTransaction row of its own, so the running total
        // starts from initial_loan_amount itself. 'loan' and 'interest' both increase the balance
        // owed; 'repay' decreases it. The window function must run over ALL of this loan's
        // transactions regardless of the date filter (see AccountController::show for why), so it
        // runs in a subquery first with the date filter applied outside it.
        $withRunningBalance = DB::table('company_loan_transactions')
            ->leftJoin('accounts', 'accounts.id', '=', 'company_loan_transactions.account_id')
            ->selectRaw(
                'company_loan_transactions.*, accounts.name as account_name, accounts.account_number as account_number, '
                ."? + SUM(CASE WHEN company_loan_transactions.transaction_type = 'repay' THEN -company_loan_transactions.amount ELSE company_loan_transactions.amount END) "
                .'OVER (ORDER BY company_loan_transactions.date ASC, company_loan_transactions.id ASC) AS running_balance',
                [$companyLoan->initial_loan_amount],
            )
            ->where('company_loan_transactions.company_loan_id', $companyLoan->id);

        $transactions = LedgerQuery::paginate(
            $withRunningBalance,
            'company_loan_transactions',
            $request,
            orderByDesc: ['date', 'id'],
            perPage: 50,
        );

        return Inertia::render('company-loans/show', [
            'companyLoan' => $companyLoan,
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
