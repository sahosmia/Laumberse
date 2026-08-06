<?php

namespace App\Http\Requests\Expenses;

use Illuminate\Foundation\Http\FormRequest;

class UpdateExpenseCategoryRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255|unique:expense_categories,name,' . $this->route('expense_category')->id,
            'description' => 'nullable|string|max:500',
        ];
    }
}
