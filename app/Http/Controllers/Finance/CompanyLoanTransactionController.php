<?php

namespace App\Http\Controllers\Finance;

use App\Exceptions\InsufficientBalanceException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\StoreCompanyLoanTransactionRequest;
use App\Models\CompanyLoan;
use App\Services\CompanyLoanService;

class CompanyLoanTransactionController extends Controller
{
    public function store(StoreCompanyLoanTransactionRequest $request, CompanyLoan $companyLoan, CompanyLoanService $companyLoanService)
    {
        try {
            $companyLoanService->addTransaction($companyLoan, $request->validated());

            return redirect()->back()->with('success', 'Transaction recorded successfully.');
        } catch (InsufficientBalanceException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to record transaction.');
        }
    }
}
