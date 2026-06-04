<?php

namespace App\Http\Requests\Expenses;

use Illuminate\Foundation\Http\FormRequest;

class UpdateExpenseRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return [
            'expense_category_id' => 'required|exists:expense_categories,id',
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|string|max:255',
            'date' => 'required|date',
            'description' => 'nullable|string|max:500',
            'outlet_id' => 'nullable|exists:outlets,id',
        ];
    }
}
