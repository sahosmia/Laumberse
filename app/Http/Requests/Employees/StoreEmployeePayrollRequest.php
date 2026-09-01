<?php

namespace App\Http\Requests\Employees;

use Illuminate\Foundation\Http\FormRequest;

class StoreEmployeePayrollRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'month' => 'required|integer|between:1,12',
            'year' => 'required|integer',
            'bonus' => 'nullable|numeric|min:0',
            'deduction' => 'nullable|numeric|min:0',
            'deduction_note' => $this->input('deduction') > 0 ? 'required|string' : 'nullable|string',
            'note' => 'nullable|string|max:500',
            'account_id' => 'required|exists:accounts,id',
            'date' => 'required|date',
        ];
    }
}
