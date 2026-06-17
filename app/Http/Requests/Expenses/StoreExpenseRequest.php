<?php

namespace App\Http\Requests\Expenses;

use App\Models\ExpenseCategory;
use Illuminate\Foundation\Http\FormRequest;

class StoreExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'expense_category_id' => 'required|exists:expense_categories,id',
            'total_amount' => 'required|numeric|min:0',
            'payment_method' => 'required|string',
            'date' => 'required|date',
            'note' => 'nullable|string',
            'outlet_id' => 'nullable|exists:outlets,id',
        ];

        $category = ExpenseCategory::find($this->expense_category_id);

        if ($category) {
            switch ($category->type) {
                case ExpenseCategory::TYPE_SALARY:
                    $rules = array_merge($rules, [
                        'employee_id' => 'required|exists:employees,id',
                        'month' => 'required|integer|between:1,12',
                        'year' => 'required|integer',
                        'bonus' => 'nullable|numeric|min:0',
                        'deduction' => 'nullable|numeric|min:0',
                        'deduction_note' => $this->deduction > 0 ? 'required|string' : 'nullable|string',
                    ]);
                    break;

                case ExpenseCategory::TYPE_MATERIAL:
                    $rules = array_merge($rules, [
                        'items' => 'required|array|min:1',
                        'items.*.material_id' => 'required|exists:materials,id',
                        'items.*.quantity' => 'required|numeric|min:0.01',
                        'items.*.unit_price' => 'required|numeric|min:0',
                    ]);
                    break;

                case ExpenseCategory::TYPE_ASSET:
                    $rules = array_merge($rules, [
                        'serial_number' => 'required|string',
                        'depreciation' => 'required|numeric|min:0|max:100',
                    ]);
                    break;
            }
        }

        return $rules;
    }
}
