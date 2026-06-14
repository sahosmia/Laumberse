<?php

namespace App\Services;

use App\Models\Expense;
use App\Models\Payroll;
use App\Models\Employee;
use App\Models\GlobalSetting;
use App\Models\ExpenseMaterial;
use Illuminate\Support\Facades\DB;

class ExpenseService
{
    public function storeExpense(array $data)
    {
        return DB::transaction(function () use ($data) {
            $salaryCategoryId = GlobalSetting::get('salary_category_id');
            $materialCategoryId = GlobalSetting::get('material_expense_category_id');

            $expense = new Expense($data);

            if ($data['expense_category_id'] == $salaryCategoryId) {
                $payroll = $this->getUpdatedPayroll($data);
                $expense->payroll_id = $payroll->id;
                $expense->save();
                $payroll->update(['expense_id' => $expense->id]);
            } else {
                $expense->save();
            }

            if ($data['expense_category_id'] == $materialCategoryId && !empty($data['items'])) {
                $this->attachMaterialsToExpense($expense, $data['items']);
            }

            return $expense;
        });
    }

    public function updateExpense(Expense $expense, array $data)
    {
        return DB::transaction(function () use ($expense, $data) {
            $salaryCategoryId = GlobalSetting::get('salary_category_id');
            $materialCategoryId = GlobalSetting::get('material_expense_category_id');

            // 1. Revert old payroll if it existed
            if ($expense->payroll_id) {
                $oldPayroll = $expense->payroll;
                $oldPayroll->paid_amount -= $expense->amount;
                $this->updatePayrollStatus($oldPayroll);
                $oldPayroll->save();
            }

            // 2. Handle new Payroll if category is salary
            if ($data['expense_category_id'] == $salaryCategoryId) {
                $newPayroll = $this->getUpdatedPayroll($data);
                $data['payroll_id'] = $newPayroll->id;
            } else {
                $data['payroll_id'] = null;
            }

            // 3. Update the expense record
            $expense->update($data);

            // 4. Update the new payroll's expense_id if it's salary
            if ($data['expense_category_id'] == $salaryCategoryId && isset($newPayroll)) {
                $newPayroll->update(['expense_id' => $expense->id]);
            }

            // 5. Handle Materials
            if ($data['expense_category_id'] == $materialCategoryId) {
                $expense->materials()->delete();
                if (!empty($data['items'])) {
                    $this->attachMaterialsToExpense($expense, $data['items']);
                }
            } else {
                $expense->materials()->delete();
            }

            return $expense;
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

        $payroll->base_salary = $employee->base_salary;
        $payroll->bonus = $data['bonus'] ?? 0;
        $payroll->deduction = $data['deduction'] ?? 0;
        $payroll->deduction_note = $data['deduction_note'] ?? null;

        $payroll->net_salary = $payroll->base_salary + $payroll->bonus - $payroll->deduction;
        $payroll->paid_amount += $data['amount'];
        $this->updatePayrollStatus($payroll);
        $payroll->save();

        return $payroll;
    }

    protected function attachMaterialsToExpense(Expense $expense, array $items)
    {
        foreach ($items as $item) {
            ExpenseMaterial::create([
                'expense_id' => $expense->id,
                'material_id' => $item['material_id'],
                'quantity' => $item['quantity'],
                'unit_price' => $item['unit_price'],
                'amount' => $item['quantity'] * $item['unit_price'],
            ]);
        }
    }

    protected function updatePayrollStatus(Payroll $payroll)
    {
        if ($payroll->paid_amount >= $payroll->net_salary) {
            $payroll->status = 'completed';
        } elseif ($payroll->paid_amount > 0) {
            $payroll->status = 'partial';
        } else {
            $payroll->status = 'pending';
        }
    }
}
