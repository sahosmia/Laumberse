<?php

namespace App\Services;

use App\Exceptions\InsufficientBalanceException;
use App\Models\Account;
use App\Models\Employee;
use App\Models\EmployeeTransaction;
use Illuminate\Support\Facades\DB;

class EmployeeTransactionService
{
    public function __construct(protected AccountService $accountService) {}

    public function addTransaction(Employee $employee, array $data): EmployeeTransaction
    {
        return DB::transaction(function () use ($employee, $data) {
            $amount = round($data['amount'], 2);
            $type = $data['transaction_type'];
            $account = Account::findOrFail($data['account_id']);

            if ($type === 'loan_return' && $amount > $employee->current_balance) {
                throw new InsufficientBalanceException($employee->name, $employee->current_balance, $amount);
            }

            $employeeTransaction = EmployeeTransaction::create([
                'employee_id' => $employee->id,
                'account_id' => $account->id,
                'transaction_type' => $type,
                'amount' => $amount,
                'date' => $data['date'],
                'note' => $data['note'] ?? null,
            ]);

            $employee->current_balance = round(
                $employee->current_balance + ($type === 'loan_return' ? -$amount : $amount),
                2
            );
            $employee->save();

            $this->accountService->recordTransaction(
                $account,
                $type === 'loan_return' ? 'credit' : 'debit',
                $amount,
                ucfirst(str_replace('_', ' ', $type)).' - '.$employee->name,
                $employeeTransaction
            );

            return $employeeTransaction;
        });
    }
}
