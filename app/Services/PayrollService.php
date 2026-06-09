<?php

namespace App\Services;

use App\Models\Expense;
use App\Models\Payroll;
use App\Models\Employee;
use App\Models\GlobalSetting;
use Illuminate\Support\Facades\DB;

class PayrollService
{
    public function storePayrollExpense(array $data)
    {
        return DB::transaction(function () use ($data) {
            $salaryCategoryId = GlobalSetting::get('salary_category_id');

            if ($data['expense_category_id'] == $salaryCategoryId) {
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

                if ($payroll->paid_amount >= $payroll->net_salary) {
                    $payroll->status = 'completed';
                } else {
                    $payroll->status = 'partial';
                }

                $payroll->save();

                $expense = Expense::create([
                    'expense_category_id' => $data['expense_category_id'],
                    'payroll_id' => $payroll->id,
                    'amount' => $data['amount'],
                    'payment_method' => $data['payment_method'],
                    'date' => $data['date'],
                    'description' => $data['description'] ?? "Salary payment for {$employee->name} ({$data['month']}/{$data['year']})",
                    'outlet_id' => $data['outlet_id'] ?? null,
                ]);

                $payroll->update(['expense_id' => $expense->id]);

                return $expense;
            }

            return Expense::create($data);
        });
    }
}
