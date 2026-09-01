<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGlobalSettingsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'salary_category_id' => 'required|exists:expense_categories,id',
            'material_expense_category_id' => 'required|exists:expense_categories,id',
            'asset_purchase_category_id' => 'required|exists:expense_categories,id',
            'business_transportation_category_id' => 'required|exists:expense_categories,id',
            'delivery_transportation_category_id' => 'required|exists:expense_categories,id',
            'business_name' => 'nullable|string|max:255',
            'business_address' => 'nullable|string|max:1000',
            'business_phone' => 'nullable|string|max:50',
            'business_email' => 'nullable|email|max:255',
            'week_start_day' => 'required|integer|between:0,6',
            'logo' => 'nullable|image|max:2048',
            'favicon' => 'nullable|image|max:512',
        ];
    }
}
