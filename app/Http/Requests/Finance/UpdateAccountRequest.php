<?php

namespace App\Http\Requests\Finance;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'account_number' => ['nullable', 'string', 'max:255', Rule::unique('accounts', 'account_number')->ignore($this->route('account'))],
        ];
    }
}
