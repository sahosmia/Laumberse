<?php

namespace App\Http\Requests\Expenses;

use Illuminate\Foundation\Http\FormRequest;

class UpdateExpenseRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        $materialCategoryId = \App\Models\GlobalSetting::get('material_expense_category_id');
        $isMaterial = $this->input('expense_category_id') == $materialCategoryId;

        return [
            'expense_category_id' => 'required|exists:expense_categories,id',
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|string|max:255',
            'date' => 'required|date',
            'description' => 'nullable|string|max:500',
            'outlet_id' => 'nullable|exists:outlets,id',

            // Material specific fields
            'items' => $isMaterial ? 'nullable|array' : 'nullable',
            'items.*.material_id' => $isMaterial ? 'required|exists:materials,id' : 'nullable',
            'items.*.quantity' => $isMaterial ? 'required|numeric|min:0.01' : 'nullable',
            'items.*.unit_price' => $isMaterial ? 'required|numeric|min:0' : 'nullable',
        ];
    }
}
