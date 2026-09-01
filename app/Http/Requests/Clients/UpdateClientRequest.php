<?php

namespace App\Http\Requests\Clients;

use Illuminate\Validation\Rule;

class UpdateClientRequest extends StoreClientRequest
{
    public function rules(): array
    {
        return array_merge(parent::rules(), [
            'username' => [
                'nullable', 'string', 'max:255', 'required_with:password',
                Rule::unique('clients', 'username')->ignore($this->route('client')),
            ],
            // On update, the password may be left blank to keep the client's current one.
            'password' => ['nullable', 'string', 'min:6'],
        ]);
    }
}
