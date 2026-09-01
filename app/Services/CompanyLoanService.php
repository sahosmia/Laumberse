<?php

namespace App\Services;

use App\Exceptions\InsufficientBalanceException;
use App\Models\Account;
use App\Models\CompanyLoan;
use App\Models\CompanyLoanTransaction;
use App\Support\OutletContext;
use Illuminate\Support\Facades\DB;

class CompanyLoanService
{
    public function __construct(protected AccountService $accountService) {}

    public function createLoan(array $data): CompanyLoan
    {
        $initialAmount = round($data['initial_loan_amount'], 2);

        return DB::transaction(function () use ($data, $initialAmount) {
            $loan = CompanyLoan::create([
                'lender_name' => $data['lender_name'],
                'initial_loan_amount' => $initialAmount,
                'current_balance' => $initialAmount,
            ]);

            // Recorded as a real ledger row (no account — it isn't a cash movement, just the
            // loan's starting balance) so it's visible in the transaction history. Given a real
            // outlet_id, same reasoning as InvestorService::createInvestor() — a brand new loan's
            // money has to belong to some outlet so it counts toward that outlet's Financial
            // Position Company Loan figure, not just the company-wide total.
            if ($initialAmount > 0) {
                CompanyLoanTransaction::create([
                    'company_loan_id' => $loan->id,
                    'account_id' => null,
                    'outlet_id' => OutletContext::resolveForWrite($data['outlet_id'] ?? null),
                    'transaction_type' => 'loan',
                    'amount' => $initialAmount,
                    'date' => now()->toDateString(),
                    'note' => 'Opening loan amount',
                ]);
            }

            return $loan;
        });
    }

    public function addTransaction(CompanyLoan $loan, array $data): CompanyLoanTransaction
    {
        return DB::transaction(function () use ($loan, $data) {
            $amount = round($data['amount'], 2);
            $type = $data['transaction_type'];
            $account = isset($data['account_id']) ? Account::findOrFail($data['account_id']) : null;

            if ($type === 'repay' && $amount > $loan->current_balance) {
                throw new InsufficientBalanceException($loan->lender_name, $loan->current_balance, $amount);
            }

            $loanTransaction = CompanyLoanTransaction::create([
                'company_loan_id' => $loan->id,
                'account_id' => $account?->id,
                'outlet_id' => OutletContext::resolveForWrite($data['outlet_id'] ?? null),
                'transaction_type' => $type,
                'amount' => $amount,
                'date' => $data['date'],
                'note' => $data['note'] ?? null,
            ]);

            $loan->current_balance = round(
                $loan->current_balance + ($type === 'repay' ? -$amount : $amount),
                2
            );
            $loan->save();

            if ($account && $type !== 'interest') {
                $this->accountService->recordTransaction(
                    $account,
                    $type === 'loan' ? 'credit' : 'debit',
                    $amount,
                    ucfirst($type).' - '.$loan->lender_name,
                    $loanTransaction
                );
            }

            return $loanTransaction;
        });
    }
}
