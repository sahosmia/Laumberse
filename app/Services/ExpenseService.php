<?php

namespace App\Services;

use App\Enums\ExpenseType;
use App\Enums\PayrollStatus;
use App\Models\Account;
use App\Models\Employee;
use App\Models\Expense;
use App\Models\ExpenseMaterial;
use App\Models\Payroll;
use App\Support\OutletContext;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class ExpenseService
{
    public function __construct(protected AccountService $accountService) {}

    public function storeExpense(array $data)
    {
        if (isset($data['amount'])) {
            $data['amount'] = round($data['amount'], 2);
        }

        return DB::transaction(function () use ($data) {
            $type = Expense::classifyType($data['expense_category_id'] ?? null, ! empty($data['asset_id']));
            $data['type'] = $type->value;

            $account = Account::findOrFail($data['account_id']);
            $data['payment_method'] = $account->name;

            // Explicitly restricted to Expense's own fillable columns rather than relying on
            // Eloquent's mass-assignment guarding to drop the payroll/material-only keys $data
            // also carries (employee_id, month, year, bonus, deduction, items, ...): guarding is
            // only enforced when the model isn't globally unguarded, and `php artisan db:seed`
            // unguards every model for the whole run (see Laravel's SeedCommand), which let those
            // extra keys straight through into the INSERT and blew up on unknown columns.
            $expense = new Expense(Arr::only($data, (new Expense)->getFillable()));
            $expense->outlet_id = OutletContext::resolveForWrite($data['outlet_id'] ?? null);

            if ($type === ExpenseType::Salary) {
                $payroll = $this->getUpdatedPayroll($data);
                $expense->payroll_id = $payroll->id;
                $expense->save();
                $payroll->update(['expense_id' => $expense->id]);
            } else {
                $expense->save();
            }

            if ($type === ExpenseType::Material && ! empty($data['items'])) {
                $this->attachMaterialsToExpense($expense, $data['items']);
            }

            $this->accountService->recordTransaction(
                $account,
                'debit',
                $expense->amount,
                'Expense - '.($expense->description ?: $data['expense_category_id']),
                $expense
            );

            return $expense;
        });
    }

    public function updateExpense(Expense $expense, array $data)
    {
        if (isset($data['amount'])) {
            $data['amount'] = round($data['amount'], 2);
        }

        return DB::transaction(function () use ($expense, $data) {
            $type = Expense::classifyType($data['expense_category_id'] ?? null, ! empty($data['asset_id']) || $expense->type === ExpenseType::Asset);
            $data['type'] = $type->value;

            // 0. Reverse the previous account debit; it will be re-applied below with final figures.
            $this->accountService->reverseTransactionsFor($expense);

            $account = Account::findOrFail($data['account_id']);
            $data['payment_method'] = $account->name;

            // 1. Revert old payroll if it existed
            if ($expense->payroll_id) {
                $oldPayroll = $expense->payroll;
                $oldPayroll->paid_amount -= $expense->amount;
                $this->updatePayrollStatus($oldPayroll);
                $oldPayroll->save();
            }

            // 2. Handle new Payroll if category is salary
            if ($type === ExpenseType::Salary) {
                $newPayroll = $this->getUpdatedPayroll($data);
                $data['payroll_id'] = $newPayroll->id;
            } else {
                $data['payroll_id'] = null;
            }

            // 3. Update the expense record — restricted to fillable columns for the same reason
            // storeExpense() constructs its Expense explicitly (see the comment there).
            $expense->update(Arr::only($data, $expense->getFillable()));

            // 4. Update the new payroll's expense_id if it's salary
            if ($type === ExpenseType::Salary && isset($newPayroll)) {
                $newPayroll->update(['expense_id' => $expense->id]);
            }

            // 5. Handle Materials
            if ($type === ExpenseType::Material) {
                $expense->materials()->delete();
                if (! empty($data['items'])) {
                    $this->attachMaterialsToExpense($expense, $data['items']);
                }
            } else {
                if ($expense->materials()->exists()) {
                    $expense->materials()->delete();
                }
            }

            // 6. Re-apply the debit against the (possibly new) account using the final amount.
            $this->accountService->recordTransaction(
                $account,
                'debit',
                $expense->amount,
                'Expense - '.($expense->description ?: $data['expense_category_id']),
                $expense
            );

            return $expense;
        });
    }

    public function deleteExpense(Expense $expense): void
    {
        DB::transaction(function () use ($expense) {
            $this->accountService->reverseTransactionsFor($expense);
            $expense->delete();
        });
    }

    protected function getUpdatedPayroll(array $data)
    {
        $employee = Employee::findOrFail($data['employee_id']);

        $payroll = Payroll::firstOrNew([
            'employee_id' => $data['employee_id'],
            'month' => $data['month'],
            'year' => $data['year'],
        ]);

        $payroll->base_salary = round($employee->base_salary, 2);
        $payroll->bonus = round($data['bonus'] ?? 0, 2);
        $payroll->deduction = round($data['deduction'] ?? 0, 2);
        $payroll->deduction_note = $data['deduction_note'] ?? null;
        $payroll->note = $data['note'] ?? null;

        $payroll->net_salary = round($payroll->base_salary + $payroll->bonus - $payroll->deduction, 2);
        $payroll->paid_amount = round($payroll->paid_amount + $data['amount'], 2);
        $this->updatePayrollStatus($payroll);
        $payroll->save();

        return $payroll;
    }

    protected function attachMaterialsToExpense(Expense $expense, array $items)
    {
        $totalAmount = 0;
        foreach ($items as $item) {
            $quantity = round($item['quantity'], 2);
            $unitPrice = round($item['unit_price'], 2);
            $lineAmount = round($quantity * $unitPrice, 2);
            $totalAmount += $lineAmount;

            ExpenseMaterial::create([
                'expense_id' => $expense->id,
                'material_id' => $item['material_id'],
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
                'amount' => $lineAmount,
            ]);
        }

        $expense->update(['amount' => round($totalAmount, 2)]);
    }

    protected function updatePayrollStatus(Payroll $payroll)
    {
        if ($payroll->paid_amount >= $payroll->net_salary) {
            $payroll->status = PayrollStatus::Completed;
        } elseif ($payroll->paid_amount > 0) {
            $payroll->status = PayrollStatus::Partial;
        } else {
            $payroll->status = PayrollStatus::Pending;
        }
    }
}
