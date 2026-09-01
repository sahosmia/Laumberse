<?php

namespace App\Http\Controllers\Employees;

use App\Exceptions\InsufficientBalanceException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Employees\StoreEmployeeTransactionRequest;
use App\Models\Employee;
use App\Services\EmployeeTransactionService;
use App\Support\OutletContext;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class EmployeeTransactionController extends Controller
{
    public function store(StoreEmployeeTransactionRequest $request, Employee $employee, EmployeeTransactionService $employeeTransactionService)
    {
        if (! OutletContext::canAccess($employee->outlet_id)) {
            throw new NotFoundHttpException;
        }

        try {
            $employeeTransactionService->addTransaction($employee, $request->validated());

            return redirect()->back()->with('success', 'Transaction recorded successfully.');
        } catch (InsufficientBalanceException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to record transaction.');
        }
    }
}
