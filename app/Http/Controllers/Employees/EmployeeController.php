<?php

namespace App\Http\Controllers\Employees;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Payroll;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    public function getEligibleForPayroll(Request $request)
    {
        $request->validate([
            'month' => 'required|integer|between:1,12',
            'year' => 'required|integer',
        ]);

        $month = $request->month;
        $year = $request->year;

        $employees = Employee::where('is_active', true)
            ->whereDoesntHave('payrolls', function ($query) use ($month, $year) {
                $query->where('month', $month)
                    ->where('year', $year)
                    ->where('status', 'completed');
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
                    'status' => $payroll ? $payroll->status : 'pending',
                ];
            });

        return response()->json($employees);
    }
}
