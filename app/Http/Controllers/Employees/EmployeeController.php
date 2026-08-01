<?php

namespace App\Http\Controllers\Employees;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Payroll;
use App\Http\Requests\Employees\StoreEmployeeRequest;
use App\Http\Requests\Employees\UpdateEmployeeRequest;
use App\Http\Requests\Employees\GetEligibleForPayrollRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    public function index()
    {
        return Inertia::render('employees/index', [
            'employees' => Employee::all()
        ]);
    }

    public function store(StoreEmployeeRequest $request)
    {
        Employee::create($request->validated());

        return redirect()->back()->with('success', 'Employee added successfully');
    }

    public function show(Request $request, Employee $employee){
        return $employee;
    }

    public function update(UpdateEmployeeRequest $request, Employee $employee)
    {
        $employee->update($request->validated());

        return redirect()->back()->with('success', 'Employee updated successfully');
    }

    public function destroy(Employee $employee)
    {
        $employee->delete();
        return redirect()->back()->with('success', 'Employee deleted successfully');
    }

    public function getEligibleForPayroll(GetEligibleForPayrollRequest $request)
    {
        $month = $request->validated()['month'];
        $year = $request->validated()['year'];

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
