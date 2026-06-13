<?php

namespace App\Http\Requests\ManageAssets;

use Illuminate\Foundation\Http\FormRequest;

class UpdateManageAssetRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'purchase_date' => 'required|date',
            'cost' => 'required|numeric|min:0',
            'status' => 'required|string|max:100',
            'asset_category_id' => 'required|exists:asset_categories,id',
        ];
    }
}
