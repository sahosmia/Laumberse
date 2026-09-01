<?php

namespace App\Services;

use App\Exceptions\InsufficientBalanceException;
use App\Models\Account;
use App\Models\Investor;
use App\Models\InvestorTransaction;
use App\Support\OutletContext;
use Illuminate\Support\Facades\DB;

class InvestorService
{
    public function __construct(protected AccountService $accountService) {}

    public function createInvestor(array $data): Investor
    {
        return DB::transaction(function () use ($data) {
            $openingBalance = round($data['opening_balance'] ?? 0, 2);

            $investor = Investor::create([
                'name' => $data['name'],
                'phone' => $data['phone'] ?? null,
                'opening_balance' => $openingBalance,
                'current_balance' => $openingBalance,
            ]);

            // Recorded as a real ledger row (no account — it isn't a cash movement, just the
            // investor's starting balance) so it's visible in the transaction history, not only
            // baked into current_balance. See InvestorController::show()'s running-balance query.
            // Given a real outlet_id (like every other transaction) so it counts toward that
            // outlet's Financial Position Capital — a brand new investor's money has to belong to
            // some outlet, the same as any other invest/withdraw transaction.
            if ($openingBalance > 0) {
                InvestorTransaction::create([
                    'investor_id' => $investor->id,
                    'account_id' => null,
                    'outlet_id' => OutletContext::resolveForWrite($data['outlet_id'] ?? null),
                    'transaction_type' => 'invest',
                    'amount' => $openingBalance,
                    'date' => now()->toDateString(),
                    'note' => 'Opening balance',
                ]);
            }

            return $investor;
        });
    }

    public function addTransaction(Investor $investor, array $data): InvestorTransaction
    {
        return DB::transaction(function () use ($investor, $data) {
            $amount = round($data['amount'], 2);
            $account = Account::findOrFail($data['account_id']);

            if ($data['transaction_type'] === 'withdraw' && $amount > $investor->current_balance) {
                throw new InsufficientBalanceException($investor->name, $investor->current_balance, $amount);
            }

            $investorTransaction = InvestorTransaction::create([
                'investor_id' => $investor->id,
                'account_id' => $account->id,
                'outlet_id' => OutletContext::resolveForWrite($data['outlet_id'] ?? null),
                'transaction_type' => $data['transaction_type'],
                'amount' => $amount,
                'date' => $data['date'],
                'note' => $data['note'] ?? null,
            ]);

            $investor->current_balance = round(
                $investor->current_balance + ($data['transaction_type'] === 'invest' ? $amount : -$amount),
                2
            );
            $investor->save();

            $this->accountService->recordTransaction(
                $account,
                $data['transaction_type'] === 'invest' ? 'credit' : 'debit',
                $amount,
                ($data['transaction_type'] === 'invest' ? 'Investment from ' : 'Withdrawal by ').$investor->name,
                $investorTransaction
            );

            return $investorTransaction;
        });
    }
}
