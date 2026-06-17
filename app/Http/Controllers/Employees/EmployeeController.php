<?php

namespace App\Http\Controllers\Employees;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Payroll;
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

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'designation' => 'required|string|max:255',
            'base_salary' => 'required|numeric|min:0',
        ]);

        Employee::create($validated);

        return redirect()->back()->with('success', 'Employee added successfully');
    }

    public function show(Request $request, Employee $employee){
        return $employee;
    }

    public function update(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'designation' => 'required|string|max:255',
            'base_salary' => 'required|numeric|min:0',
            'is_active' => 'required|boolean',
        ]);

        $employee->update($validated);

        return redirect()->back()->with('success', 'Employee updated successfully');
    }

    public function destroy(Employee $employee)
    {
        $employee->delete();
        return redirect()->back()->with('success', 'Employee deleted successfully');
    }

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
