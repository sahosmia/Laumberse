<?php

namespace App\Http\Requests\Expenses;

use Illuminate\Support\Arr;
use Illuminate\Validation\Rule;

/**
 * An expense's outlet is fixed at creation (ExpenseService::updateExpense() never touches it), so
 * `outlet_id` is dropped entirely here — same reasoning as UpdateInvoiceRequest. `account_id` is
 * also overridden rather than inherited as-is: StoreExpenseRequest's version checks against
 * OutletContext::resolvableForWrite(), which is meant for a brand-new record and would wrongly
 * check the *editor's own current outlet* instead of this expense's fixed one.
 */
class UpdateExpenseRequest extends StoreExpenseRequest
{
    public function rules(): array
    {
        $expense = $this->route('expense');

        return array_merge(
            Arr::except(parent::rules(), ['outlet_id']),
            [
                'account_id' => [
                    'required',
                    Rule::exists('accounts', 'id')->where(fn ($q) => $q->where('outlet_id', $expense?->outlet_id ?? -1)),
                ],
            ],
        );
    }
}
