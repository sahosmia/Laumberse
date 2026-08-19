<?php

namespace App\Http\Requests\Products;

use Illuminate\Validation\Rule;

class UpdateProductRequest extends StoreProductRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('products', 'name')->ignore($this->route('product'))],
            'category_id' => 'required|exists:categories,id',
            'image' => 'nullable|image|max:2048',
            'price' => 'required|numeric|min:0',
        ];
    }
}
