<?php

namespace App\Http\Requests\Finance;

use App\Support\OutletContext;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCompanyLoanTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isInterest = $this->input('transaction_type') === 'interest';

        return [
            // Only meaningful for a switch-capable user currently viewing "All Outlets" — see
            // App\Support\OutletContext::resolveForWrite.
            'outlet_id' => [
                Rule::requiredIf(fn () => OutletContext::isAll()),
                'nullable',
                Rule::exists('outlets', 'id')->where('status', 'active'),
            ],
            'transaction_type' => 'required|in:loan,repay,interest',
            // Must belong to the same outlet this transaction is being written to (see
            // OutletContext::resolvableForWrite).
            'account_id' => [
                $isInterest ? 'nullable' : 'required',
                Rule::exists('accounts', 'id')->where(
                    fn ($q) => $q->where('outlet_id', OutletContext::resolvableForWrite($this->input('outlet_id')) ?? -1)
                ),
            ],
            'amount' => 'required|numeric|gt:0',
            'date' => 'required|date',
            'note' => 'nullable|string|max:500',
        ];
    }
}
