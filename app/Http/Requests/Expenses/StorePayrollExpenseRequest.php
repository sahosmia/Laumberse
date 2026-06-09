<?php

namespace App\Http\Requests\Expenses;

use App\Models\GlobalSetting;
use Illuminate\Foundation\Http\FormRequest;

class StorePayrollExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $salaryCategoryId = GlobalSetting::get('salary_category_id');
        $isPayroll = $this->input('expense_category_id') == $salaryCategoryId;

        return [
            'expense_category_id' => 'required|exists:expense_categories,id',
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|string',
            'date' => 'required|date',
            'description' => 'nullable|string',
            'outlet_id' => 'nullable|exists:outlets,id',

            // Payroll specific fields
            'employee_id' => $isPayroll ? 'required|exists:employees,id' : 'nullable',
            'month' => $isPayroll ? 'required|integer|between:1,12' : 'nullable',
            'year' => $isPayroll ? 'required|integer' : 'nullable',
            'bonus' => $isPayroll ? 'nullable|numeric|min:0' : 'nullable',
            'deduction' => $isPayroll ? 'nullable|numeric|min:0' : 'nullable',
            'deduction_note' => ($isPayroll && $this->input('deduction') > 0) ? 'required|string' : 'nullable|string',
        ];
    }
}
