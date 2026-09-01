<?php

namespace App\Http\Requests\Employees;

use Illuminate\Foundation\Http\FormRequest;

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
            'account_id' => 'required|exists:accounts,id',
            'amount' => 'required|numeric|gt:0',
            'date' => 'required|date',
            'note' => 'nullable|string|max:500',
        ];
    }
}
