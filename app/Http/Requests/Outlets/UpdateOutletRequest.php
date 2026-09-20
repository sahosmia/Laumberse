<?php

namespace App\Http\Requests\Outlets;

use App\Support\OutletFeatures;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOutletRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'code' => ['required', 'string', 'max:50', Rule::unique('outlets', 'code')->ignore($this->route('outlet'))],
            'address' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'status' => 'required|in:active,inactive',
            'include_in_consolidated_reporting' => 'nullable|boolean',
            'disabled_features' => 'nullable|array',
            'disabled_features.*' => [Rule::in(array_keys(OutletFeatures::ALL))],
        ];
    }
}
