<?php

namespace App\Http\Requests\Assets;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAssetRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:100|unique:assets,code,' . $this->asset->id,
            'purchase_date' => 'required|date',
            'cost' => 'required|numeric|min:0',
            'current_value' => 'required|numeric|min:0',
            'depreciation_rate' => 'nullable|numeric|min:0|max:100',
            'status' => 'required|string|max:100',
        ];
    }
}
