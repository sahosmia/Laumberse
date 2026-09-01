<?php

namespace App\Actions\Employees;

use App\Enums\PayrollStatus;
use App\Models\Employee;
use App\Support\OutletContext;
use Illuminate\Support\Collection;

class GetEligibleEmployeesForPayrollAction
{
    public function __invoke(int $month, int $year): Collection
    {
        return Employee::tap(fn ($q) => OutletContext::scope($q))
            ->active()
            ->whereDoesntHave('payrolls', function ($query) use ($month, $year) {
                $query->where('month', $month)
                    ->where('year', $year)
                    ->where('status', PayrollStatus::Completed->value);
            })
            // Eager-loaded once for every eligible employee here, instead of one Payroll query per
            // employee inside the map() below — same WHERE predicate (employee_id + month + year)
            // as the row-by-row query it replaces, just batched into a single `IN (...)` query.
            ->with(['payrolls' => function ($query) use ($month, $year) {
                $query->where('month', $month)->where('year', $year);
            }])
            ->get()
            ->map(function ($employee) {
                $payroll = $employee->payrolls->first();

                return [
                    'id' => $employee->id,
                    'name' => $employee->name,
                    'base_salary' => $employee->base_salary,
                    'already_paid' => $payroll ? $payroll->paid_amount : 0,
                    'bonus' => $payroll ? $payroll->bonus : 0,
                    'deduction' => $payroll ? $payroll->deduction : 0,
                    'net_salary' => $payroll ? $payroll->net_salary : $employee->base_salary,
                    'status' => $payroll ? $payroll->status->value : PayrollStatus::Pending->value,
                ];
            });
    }
}
