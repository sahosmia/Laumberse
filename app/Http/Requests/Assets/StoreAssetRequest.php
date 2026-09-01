<?php

namespace App\Http\Requests\Assets;

use App\Enums\AssetStatus;
use App\Support\OutletContext;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAssetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Only meaningful for a switch-capable user currently viewing "All Outlets" — see
            // App\Support\OutletContext::resolveForWrite.
            'outlet_id' => [
                Rule::requiredIf(fn () => OutletContext::isAll()),
                'nullable',
                Rule::exists('outlets', 'id')->where('status', 'active'),
            ],
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'purchase_date' => 'required|date',
            'cost' => 'required|numeric|min:0',
            'status' => ['required', 'string', Rule::enum(AssetStatus::class)],
            'asset_category_id' => 'required|exists:asset_categories,id',
            'is_new_purchase' => 'nullable|boolean',
            'account_id' => 'nullable|required_if:is_new_purchase,true|exists:accounts,id',
        ];
    }
}
