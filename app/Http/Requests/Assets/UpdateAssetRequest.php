<?php

namespace App\Http\Requests\Assets;

use App\Enums\AssetStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAssetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'purchase_date' => 'required|date',
            'cost' => 'required|numeric|min:0',
            'status' => ['required', 'string', Rule::enum(AssetStatus::class)],
            'asset_category_id' => 'required|exists:asset_categories,id',
        ];
    }
}
