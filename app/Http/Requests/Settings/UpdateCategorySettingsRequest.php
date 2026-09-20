<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCategorySettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'salary_category_id' => 'required|exists:expense_categories,id',
            'material_expense_category_id' => 'required|exists:expense_categories,id',
            'asset_purchase_category_id' => 'required|exists:expense_categories,id',
            'business_transportation_category_id' => 'required|exists:expense_categories,id',
            'delivery_transportation_category_id' => 'required|exists:expense_categories,id',
        ];
    }
}
