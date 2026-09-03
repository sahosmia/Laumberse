<?php

namespace App\Http\Requests\Clients;

use App\Enums\ClientType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreClientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'type' => ['required', 'string', Rule::enum(ClientType::class)],
            // A Corporate client isn't tied to any single branch — every other type must have one.
            'outlet_id' => [
                'nullable',
                'prohibited_if:type,Corporate',
                'required_unless:type,Corporate',
                Rule::exists('outlets', 'id')->where('status', 'active'),
            ],
            'address' => 'nullable|string|max:500',
            'internal_note' => 'nullable|string|max:2000',
            'username' => ['nullable', 'string', 'max:255', 'required_with:password', Rule::unique('clients', 'username')],
            'password' => ['nullable', 'string', 'min:6', 'required_with:username'],
            'custom_prices' => 'nullable|array',
            'custom_prices.*.product_id' => 'required|exists:products,id',
            'custom_prices.*.custom_price' => 'required|numeric|min:0',
        ];
    }
}
