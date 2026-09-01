<?php

namespace App\Http\Requests\Finance;

use App\Support\OutletContext;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAccountRequest extends FormRequest
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
            'account_number' => 'nullable|string|max:255|unique:accounts,account_number',
            'opening_balance' => 'nullable|numeric|min:0',
        ];
    }
}
