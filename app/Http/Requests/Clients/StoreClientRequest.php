<?php

namespace App\Http\Requests\Clients;

use Illuminate\Foundation\Http\FormRequest;

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
            'type' => 'required|string|in:Consumer,Corporate,B2B',
            'address' => 'nullable|string|max:500',
            'custom_prices' => 'nullable|array',
            'custom_prices.*.product_id' => 'required|exists:products,id',
            'custom_prices.*.custom_price' => 'required|numeric|min:0',
        ];
    }
}
