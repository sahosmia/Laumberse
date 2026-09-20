<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBusinessSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'business_name' => 'nullable|string|max:255',
            'business_address' => 'nullable|string|max:1000',
            'business_phone' => 'nullable|string|max:50',
            'business_email' => 'nullable|email|max:255',
        ];
    }
}
