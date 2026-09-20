<?php

namespace App\Http\Requests\Employees;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEmployeeTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'transaction_type' => 'required|in:advance,loan,loan_return',
            // Must belong to this employee's own (fixed) outlet — see EmployeeController::show's
            // matching `accounts` scoping.
            'account_id' => [
                'required',
                Rule::exists('accounts', 'id')->where(fn ($q) => $q->where('outlet_id', $this->route('employee')?->outlet_id ?? -1)),
            ],
            'amount' => 'required|numeric|gt:0',
            'date' => 'required|date',
            'note' => 'nullable|string|max:500',
        ];
    }
}
