<?php

namespace App\Http\Requests\Clients;

use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

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

    /**
     * Deliberately does NOT inherit StoreClientRequest's outlet/type gating: every edit
     * round-trips the client's current `type` even when only unrelated fields (name, phone, ...)
     * actually changed, so re-checking it against the outlet's *current* feature config would
     * start rejecting harmless edits the moment an admin disables that type later — same reasoning
     * as StoreClientActivityRequest only gating create, not update.
     */
    public function withValidator(Validator $validator): void {}
}
