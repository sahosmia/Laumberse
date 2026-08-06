<?php

namespace App\Http\Requests\Expenses;

use App\Models\GlobalSetting;
use Illuminate\Foundation\Http\FormRequest;

class StoreExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $salaryCategoryId = GlobalSetting::get('salary_category_id');
        $materialCategoryId = GlobalSetting::get('material_expense_category_id');

        $isPayroll = $this->input('expense_category_id') == $salaryCategoryId;
        $isMaterial = $this->input('expense_category_id') == $materialCategoryId;

        return [
            'expense_category_id' => 'required|exists:expense_categories,id',
            'amount' => 'required|numeric|gt:0',
            'payment_method' => 'required|string|max:255',
            'date' => 'required|date',
            'description' => 'nullable|string|max:500',

            // Material specific fields
            'items' => $isMaterial ? 'required|array|min:1' : 'nullable|array',
            'items.*.material_id' => $isMaterial ? 'required|exists:materials,id' : 'nullable',
            'items.*.quantity' => $isMaterial ? 'required|numeric|min:0.01' : 'nullable',
            'items.*.unit_price' => $isMaterial ? 'required|numeric|gt:0' : 'nullable',

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
