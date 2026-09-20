<?php

namespace App\Http\Requests\Employees;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
            // Must belong to this employee's own (fixed) outlet — see EmployeeController::show's
            // matching `accounts` scoping.
            'account_id' => [
                'required',
                Rule::exists('accounts', 'id')->where(fn ($q) => $q->where('outlet_id', $this->route('employee')?->outlet_id ?? -1)),
            ],
            'date' => 'required|date',
        ];
    }
}
