<?php

namespace App\Services;

use App\Exceptions\InsufficientBalanceException;
use App\Models\Account;
use App\Models\AccountTransaction;
use App\Models\AccountTransfer;
use App\Support\OutletContext;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class AccountService
{
    public function createAccount(array $data): Account
    {
        return DB::transaction(function () use ($data) {
            $openingBalance = round($data['opening_balance'] ?? 0, 2);

            $account = Account::create([
                'outlet_id' => OutletContext::resolveForWrite($data['outlet_id'] ?? null),
                'name' => $data['name'],
                'account_number' => $data['account_number'] ?? null,
                'opening_balance' => $openingBalance,
                'current_balance' => $openingBalance,
            ]);

            if ($openingBalance > 0) {
                AccountTransaction::create([
                    'account_id' => $account->id,
                    'type' => 'credit',
                    'amount' => $openingBalance,
                    'description' => 'Opening balance',
                    'reference_id' => $account->id,
                    'reference_type' => Account::class,
                ]);
            }

            return $account;
        });
    }

    /** Renames/re-numbers an account only — never touches balance, which is derived purely from ledger transactions. */
    public function updateAccount(Account $account, array $data): Account
    {
        $account->update([
            'name' => $data['name'],
            'account_number' => $data['account_number'] ?? null,
        ]);

        return $account;
    }

    public function recordTransaction(Account $account, string $type, float $amount, ?string $description = null, ?Model $reference = null): AccountTransaction
    {
        $amount = round($amount, 2);

        // Re-fetch under a row lock (inside the caller's DB::transaction) so two concurrent
        // debits against the same account can't both read a stale balance and both pass the
        // insufficient-balance check below.
        $account = Account::whereKey($account->id)->lockForUpdate()->firstOrFail();

        if ($type === 'debit' && $amount > $account->current_balance) {
            throw new InsufficientBalanceException($account->name, $account->current_balance, $amount);
        }

        $transaction = AccountTransaction::create([
            'account_id' => $account->id,
            'type' => $type,
            'amount' => $amount,
            'description' => $description,
            'reference_id' => $reference?->id,
            'reference_type' => $reference ? $reference::class : null,
        ]);

        $account->current_balance = round($account->current_balance + ($type === 'credit' ? $amount : -$amount), 2);
        $account->save();

        return $transaction;
    }

    /**
     * Moves money from one account to another — a debit on $from and a credit on $to, both
     * linked to the same AccountTransfer record so they show up together in each account's
     * transaction history. Reuses recordTransaction()'s balance check/lock, so transferring more
     * than $from currently holds throws InsufficientBalanceException same as any other debit.
     */
    public function transferFunds(Account $from, Account $to, float $amount, string $date, ?string $note = null): AccountTransfer
    {
        if ($from->id === $to->id) {
            throw new InvalidArgumentException('Cannot transfer an account to itself.');
        }

        return DB::transaction(function () use ($from, $to, $amount, $date, $note) {
            $amount = round($amount, 2);

            $transfer = AccountTransfer::create([
                'from_account_id' => $from->id,
                'to_account_id' => $to->id,
                'amount' => $amount,
                'date' => $date,
                'note' => $note,
                'user_id' => auth()->id(),
            ]);

            $this->recordTransaction($from, 'debit', $amount, "Transfer to \"{$to->name}\"", $transfer);
            $this->recordTransaction($to, 'credit', $amount, "Transfer from \"{$from->name}\"", $transfer);

            return $transfer;
        });
    }

    /**
     * Void every account transaction linked to a given reference model (e.g. an Expense being
     * edited or deleted), restoring each affected account's balance to what it was before.
     */
    public function reverseTransactionsFor(Model $reference): void
    {
        AccountTransaction::where('reference_type', $reference::class)
            ->where('reference_id', $reference->id)
            ->get()
            ->each(fn (AccountTransaction $transaction) => $this->reverseTransaction($transaction));
    }

    public function reverseTransaction(AccountTransaction $transaction): void
    {
        $account = $transaction->account;
        $account->current_balance = round(
            $account->current_balance + ($transaction->type === 'debit' ? $transaction->amount : -$transaction->amount),
            2
        );
        $account->save();

        $transaction->delete();
    }
}
