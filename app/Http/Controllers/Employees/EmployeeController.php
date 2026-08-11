<?php

namespace App\Http\Controllers\Employees;

use App\Actions\Employees\GetEligibleEmployeesForPayrollAction;
use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Http\Requests\Employees\StoreEmployeeRequest;
use App\Http\Requests\Employees\UpdateEmployeeRequest;
use App\Http\Requests\Employees\GetEligibleForPayrollRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $employees = Employee::when($request->search, fn($q, $s) => $q->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")->orWhere('designation', 'like', "%{$s}%");
            }))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('employees/index', [
            'employees' => $employees,
            'filters' => ['search' => $request->search],
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

    public function getEligibleForPayroll(GetEligibleForPayrollRequest $request, GetEligibleEmployeesForPayrollAction $action)
    {
        $validated = $request->validated();

        return response()->json($action($validated['month'], $validated['year']));
    }
}
