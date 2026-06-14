<?php

namespace App\Http\Requests\Materials;

use Illuminate\Foundation\Http\FormRequest;

class StoreMaterialRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'market_price' => 'required|numeric|min:0',
        ];
    }
}
