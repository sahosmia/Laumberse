<?php

namespace App\Actions\Employees;

use App\Enums\PayrollStatus;
use App\Models\Employee;
use App\Models\Payroll;
use Illuminate\Support\Collection;

class GetEligibleEmployeesForPayrollAction
{
    public function __invoke(int $month, int $year): Collection
    {
        return Employee::where('is_active', true)
            ->whereDoesntHave('payrolls', function ($query) use ($month, $year) {
                $query->where('month', $month)
                    ->where('year', $year)
                    ->where('status', PayrollStatus::Completed->value);
            })
            ->get()
            ->map(function ($employee) use ($month, $year) {
                $payroll = Payroll::where('employee_id', $employee->id)
                    ->where('month', $month)
                    ->where('year', $year)
                    ->first();

                return [
                    'id' => $employee->id,
                    'name' => $employee->name,
                    'base_salary' => $employee->base_salary,
                    'already_paid' => $payroll ? $payroll->paid_amount : 0,
                    'bonus' => $payroll ? $payroll->bonus : 0,
                    'deduction' => $payroll ? $payroll->deduction : 0,
                    'net_salary' => $payroll ? $payroll->net_salary : $employee->base_salary,
                    'status' => $payroll ? $payroll->status : PayrollStatus::Pending->value,
                ];
            });
    }
}
