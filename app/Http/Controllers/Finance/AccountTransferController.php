<?php

namespace App\Http\Controllers\Finance;

use App\Exceptions\InsufficientBalanceException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\StoreAccountTransferRequest;
use App\Models\Account;
use App\Services\AccountService;
use App\Support\OutletContext;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class AccountTransferController extends Controller
{
    public function store(StoreAccountTransferRequest $request, AccountService $accountService)
    {
        $validated = $request->validated();
        $from = Account::findOrFail($validated['from_account_id']);
        $to = Account::findOrFail($validated['to_account_id']);

        // A transfer can only ever move funds within a single outlet's own books — allowing it
        // across outlets would silently move capital between what are meant to be independently
        // reportable businesses. Both legs must also be visible under the current context (the
        // usual cross-outlet-access check), not just equal to each other. Deliberately outside the
        // try/catch below: a 404 here must reach the client as an actual 404, not get swallowed
        // into a generic error redirect the way an exception thrown inside the try block would.
        if (! OutletContext::canAccess($from->outlet_id) || ! OutletContext::canAccess($to->outlet_id)) {
            throw new NotFoundHttpException;
        }

        if ($from->outlet_id !== $to->outlet_id) {
            return redirect()->back()->with('error', 'Funds can only be transferred between accounts in the same outlet.');
        }

        try {
            $accountService->transferFunds($from, $to, $validated['amount'], $validated['date'], $validated['note'] ?? null);

            return redirect()->back()->with('success', 'Transfer completed successfully.');
        } catch (InsufficientBalanceException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to complete transfer.');
        }
    }
}
