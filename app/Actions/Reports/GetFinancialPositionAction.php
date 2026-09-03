<?php

namespace App\Actions\Reports;

use App\Enums\InvoiceStatus;
use App\Models\Account;
use App\Models\Asset;
use App\Models\Client;
use App\Models\CompanyLoan;
use App\Models\CompanyLoanTransaction;
use App\Models\Employee;
use App\Models\Investor;
use App\Models\InvestorTransaction;
use App\Support\OutletContext;

class GetFinancialPositionAction
{
    /**
     * Closing Stock, Sundry Creditors, and Other Liabilities are left out — nothing in the system
     * tracks those (no product inventory, no accounts-payable/vendor-credit concept). Other Assets
     * (fixed assets) IS included, sourced from the Asset module.
     *
     * Capital is Investor capital, not general owner's equity; Company Loan is the lender ledger.
     * Investor/CompanyLoan themselves (the person/lender) stay global — the same investor can fund
     * multiple outlets — but each InvestorTransaction/CompanyLoanTransaction (the actual cash
     * movement) is outlet-scoped, including the opening-balance/opening-amount row
     * (InvestorService::createInvestor(), CompanyLoanService::createLoan()) — a brand new
     * investor's or loan's starting money still belongs to some outlet, resolved the same way as
     * every other transaction (OutletContext::resolveForWrite()), so it counts toward that
     * outlet's Capital/Company Loan below like any other transaction. While viewing a single
     * outlet, Capital/Company Loan are computed by summing that outlet's own transactions
     * (invest/loan minus withdraw/repay), NOT the flat current_balance column — using
     * current_balance here would double count once summed across outlets and wouldn't reflect a
     * specific outlet at all. While viewing "All Outlets" with no $asOfDate, the original flat
     * current_balance columns are used instead — already the correct, non-double-counted
     * company-wide total. Every Asset figure below (Sundry Debtors, Cash at Bank, Staff Advances,
     * Other Assets) IS outlet-scoped, in every context.
     *
     * Gross Profit is the balancing figure instead — whatever value makes Total Liability equal
     * Total Assets once Capital, Company Loan, and the (currently untracked, so zero) Sundry
     * Creditors/Other Liabilities are accounted for. That's effectively retained profit/loss not
     * yet captured by any dedicated ledger of its own.
     *
     * **$asOfDate** ('Y-m-d', or null for the live view): recomputes Capital, Company Loan, Cash
     * at Bank, and Staff Advances as they stood on that date, from each one's own dated ledger
     * (InvestorTransaction.date, CompanyLoanTransaction.date, AccountTransaction.created_at as the
     * closest available proxy — that table has no separate business `date` column — and
     * EmployeeTransaction.date). Each uses a LEFT JOIN from the owning row (Investor/CompanyLoan/
     * Account/Employee) so one with zero transactions before that date still appears at its
     * opening balance, rather than silently disappearing the way an inner join over the
     * transaction table alone would. Sundry Debtors and Other Assets are NEVER date-scoped — there
     * is no historical ledger for either (Invoice.due is a live mutable field with no payment
     * history; Asset has no disposal timestamp, only a current status), so reconstructing a past
     * value for them would mean inventing history rather than reading it. They always show today's
     * figures regardless of $asOfDate — the frontend labels them "(current)" whenever a date is
     * applied so the statement is never read as more precise than it actually is.
     */
    public function __invoke(?string $asOfDate = null): array
    {
        if ($asOfDate === null && OutletContext::currentId() === null) {
            $investors = Investor::orderBy('name')->get(['id', 'name', 'current_balance']);
            $companyLoans = CompanyLoan::orderBy('lender_name')->get(['id', 'lender_name', 'current_balance']);
        } else {
            $investors = InvestorTransaction::query()
                ->join('investors', 'investors.id', '=', 'investor_transactions.investor_id')
                ->tap(fn ($q) => OutletContext::scope($q, 'investor_transactions.outlet_id'))
                ->when($asOfDate, fn ($q) => $q->where('investor_transactions.date', '<=', $asOfDate))
                ->selectRaw("investors.id, investors.name, SUM(CASE WHEN transaction_type = 'invest' THEN amount ELSE -amount END) as current_balance")
                ->groupBy('investors.id', 'investors.name')
                ->orderBy('investors.name')
                ->get();

            $companyLoans = CompanyLoanTransaction::query()
                ->join('company_loans', 'company_loans.id', '=', 'company_loan_transactions.company_loan_id')
                ->tap(fn ($q) => OutletContext::scope($q, 'company_loan_transactions.outlet_id'))
                ->when($asOfDate, fn ($q) => $q->where('company_loan_transactions.date', '<=', $asOfDate))
                ->selectRaw("company_loans.id, company_loans.lender_name, SUM(CASE WHEN transaction_type = 'repay' THEN -amount ELSE amount END) as current_balance")
                ->groupBy('company_loans.id', 'company_loans.lender_name')
                ->orderBy('company_loans.lender_name')
                ->get();
        }
        $capitalTotal = round((float) $investors->sum('current_balance'), 2);
        $companyLoanTotal = round((float) $companyLoans->sum('current_balance'), 2);

        // Not tracked anywhere in the system yet — see docblock above.
        $sundryCreditorsTotal = 0.0;
        $otherLiabilitiesTotal = 0.0;

        // Client itself stays global, and Client.total_due is a running total aggregated across
        // every outlet's invoices — not what "this outlet's debtors" means. Recomputed here from
        // outlet-scoped Invoice.due instead of trusting that global column. Never date-scoped —
        // see docblock above. Only Delivered invoices count: an order still somewhere in the wash
        // pipeline (In House, Pre Wash, Washing, Extract, Drying, Pressing, Ready) isn't a finished
        // sale yet, so its due amount isn't a firm receivable — it becomes one only once the order
        // is actually delivered. A Cancelled invoice's due is never owed.
        $debtors = Client::query()
            ->select('clients.id', 'clients.name')
            ->selectRaw('SUM(invoices.due) as total_due')
            ->join('invoices', 'invoices.client_id', '=', 'clients.id')
            ->where('invoices.status', InvoiceStatus::Delivered->value)
            ->tap(fn ($q) => OutletContext::scope($q, 'invoices.outlet_id'))
            ->groupBy('clients.id', 'clients.name')
            ->havingRaw('SUM(invoices.due) > 0')
            ->orderByDesc('total_due')
            ->get();
        $debtorsTotal = round((float) $debtors->sum('total_due'), 2);

        if ($asOfDate === null) {
            $accounts = Account::tap(fn ($q) => OutletContext::scope($q))
                ->orderByDesc('current_balance')
                ->get(['id', 'name', 'account_number', 'current_balance']);
        } else {
            $accounts = Account::tap(fn ($q) => OutletContext::scope($q))
                ->leftJoin('account_transactions', function ($join) use ($asOfDate) {
                    $join->on('account_transactions.account_id', '=', 'accounts.id')
                        ->where('account_transactions.created_at', '<=', $asOfDate.' 23:59:59');
                })
                ->selectRaw(
                    'accounts.id, accounts.name, accounts.account_number, '
                    ."accounts.opening_balance + COALESCE(SUM(CASE WHEN account_transactions.type = 'credit' THEN account_transactions.amount ELSE -account_transactions.amount END), 0) as current_balance"
                )
                ->groupBy('accounts.id', 'accounts.name', 'accounts.account_number', 'accounts.opening_balance')
                ->orderByDesc('current_balance')
                ->get();
        }
        $accountsTotal = round((float) $accounts->sum('current_balance'), 2);

        if ($asOfDate === null) {
            $staffAdvances = Employee::tap(fn ($q) => OutletContext::scope($q))
                ->where('current_balance', '<>', 0)
                ->orderByDesc('current_balance')
                ->get(['id', 'name', 'current_balance']);
        } else {
            $staffAdvances = Employee::tap(fn ($q) => OutletContext::scope($q))
                ->leftJoin('employee_transactions', function ($join) use ($asOfDate) {
                    $join->on('employee_transactions.employee_id', '=', 'employees.id')
                        ->where('employee_transactions.date', '<=', $asOfDate);
                })
                ->selectRaw(
                    'employees.id, employees.name, '
                    ."employees.opening_balance + COALESCE(SUM(CASE WHEN employee_transactions.transaction_type = 'loan_return' THEN -employee_transactions.amount ELSE employee_transactions.amount END), 0) as current_balance"
                )
                ->groupBy('employees.id', 'employees.name', 'employees.opening_balance')
                ->havingRaw('current_balance <> 0')
                ->orderByDesc('current_balance')
                ->get();
        }
        $staffAdvancesTotal = round((float) $staffAdvances->sum('current_balance'), 2);

        // Disposed assets are no longer owned, so they don't count toward current asset value.
        // Never date-scoped — see docblock above.
        $otherAssets = Asset::tap(fn ($q) => OutletContext::scope($q))
            ->notDisposed()
            ->orderByDesc('cost')
            ->get(['id', 'name', 'cost']);
        $otherAssetsTotal = round((float) $otherAssets->sum('cost'), 2);

        $totalAssets = round($debtorsTotal + $accountsTotal + $staffAdvancesTotal + $otherAssetsTotal, 2);
        $grossProfit = round($totalAssets - ($capitalTotal + $companyLoanTotal + $sundryCreditorsTotal + $otherLiabilitiesTotal), 2);

        return [
            'as_of_date' => $asOfDate,
            'liabilities' => [
                'capital' => ['total' => $capitalTotal, 'items' => $investors],
                'company_loan' => ['total' => $companyLoanTotal, 'items' => $companyLoans],
                'gross_profit' => $grossProfit,
                'total' => $totalAssets,
            ],
            'assets' => [
                'sundry_debtors' => ['total' => $debtorsTotal, 'items' => $debtors],
                'cash_at_bank' => ['total' => $accountsTotal, 'items' => $accounts],
                'staff_advances' => ['total' => $staffAdvancesTotal, 'items' => $staffAdvances],
                'other_assets' => ['total' => $otherAssetsTotal, 'items' => $otherAssets],
                'total' => $totalAssets,
            ],
        ];
    }
}
