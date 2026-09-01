<?php

namespace App\Http\Requests\Users;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($this->route('user'))],
            'password' => $this->isMethod('post') ? ['required', Password::defaults()] : ['nullable', Password::defaults()],
            'role' => ['required', 'string', Rule::exists('roles', 'name')],
            // Every normal user needs a concrete home outlet; Admin gets full cross-outlet access
            // via the existing Gate::before role bypass regardless of this field, so it's the one
            // role allowed to leave it unset (see App\Support\OutletContext).
            'outlet_id' => [
                Rule::requiredIf(fn () => $this->input('role') !== 'Admin'),
                'nullable',
                Rule::exists('outlets', 'id')->where('status', 'active'),
            ],
        ];
    }
}
