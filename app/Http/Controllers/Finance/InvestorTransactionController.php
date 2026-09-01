<?php

namespace App\Http\Controllers\Finance;

use App\Exceptions\InsufficientBalanceException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\StoreInvestorTransactionRequest;
use App\Models\Investor;
use App\Services\InvestorService;

class InvestorTransactionController extends Controller
{
    public function store(StoreInvestorTransactionRequest $request, Investor $investor, InvestorService $investorService)
    {
        try {
            $investorService->addTransaction($investor, $request->validated());

            return redirect()->back()->with('success', 'Transaction recorded successfully.');
        } catch (InsufficientBalanceException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to record transaction.');
        }
    }
}
