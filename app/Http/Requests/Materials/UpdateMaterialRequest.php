<?php

namespace App\Http\Requests\Materials;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMaterialRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255|unique:materials,name,' . $this->material->id,
            'unit_id' => 'nullable|exists:units,id',
        ];
    }
}
