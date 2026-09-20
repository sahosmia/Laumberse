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
            // Must belong to the same outlet this asset is being written to (see
            // OutletContext::resolvableForWrite) — matches StoreExpenseRequest/StoreInvoiceRequest.
            'account_id' => [
                'nullable',
                'required_if:is_new_purchase,true',
                Rule::exists('accounts', 'id')->where(
                    fn ($q) => $q->where('outlet_id', OutletContext::resolvableForWrite($this->input('outlet_id')) ?? -1)
                ),
            ],
        ];
    }
}
