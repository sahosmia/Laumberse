<?php

namespace App\Http\Requests\Clients;

use App\Enums\ClientType;
use App\Support\OutletContext;
use App\Support\OutletFeatures;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

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

    /**
     * Rejects a client type the *creator's own active outlet* has turned off (see
     * Outlet::hasFeature) — not the client's own outlet_id, since a Corporate client is never
     * assigned one at all. Stays unrestricted while viewing "All Outlets" (nothing single to gate
     * against) or outside any authenticated context, matching OutletContext::current().
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $type = $this->input('type');
            $outlet = OutletContext::current();

            if ($type && $outlet && ! $outlet->hasFeature($type)) {
                $validator->errors()->add('type', 'This outlet does not offer '.(OutletFeatures::CLIENT_TYPES[$type] ?? $type).'.');
            }
        });
    }
}
