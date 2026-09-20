<?php

namespace App\Http\Requests\Invoices;

use App\Enums\ClientType;
use App\Enums\DiscountType;
use App\Enums\InvoiceStatus;
use App\Models\Outlet;
use App\Support\OutletContext;
use App\Support\OutletFeatures;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreInvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Only meaningful for a switch-capable user currently viewing "All Outlets" — everyone
            // else's outlet_id is resolved server-side regardless of this field (see
            // App\Support\OutletContext::resolveForWrite).
            'outlet_id' => [
                Rule::requiredIf(fn () => OutletContext::isAll()),
                'nullable',
                Rule::exists('outlets', 'id')->where('status', 'active'),
            ],
            'date' => 'required|date',
            'client_id' => 'required_without:create_new_client|required_if:create_new_client,false|nullable|exists:clients,id',
            'create_new_client' => 'boolean',
            'new_client_name' => 'required_if:create_new_client,true|nullable|string|max:255',
            'new_client_phone' => 'required_if:create_new_client,true|nullable|string|max:255',
            'new_client_address' => 'nullable|string|max:255',
            'new_client_type' => ['required_if:create_new_client,true', 'nullable', 'string', Rule::enum(ClientType::class)],

            'total' => 'required|numeric|min:0',
            'paid' => 'nullable|numeric|min:0',
            'due' => 'required|numeric',
            'status' => ['required', 'string', Rule::in(InvoiceStatus::formValues())],
            // Only require a payment account once something has actually been paid — an invoice
            // created as fully unpaid doesn't need one yet. When one is given, it must belong to
            // the same outlet this invoice is being written to (see OutletContext::resolvableForWrite).
            'account_id' => [
                Rule::requiredIf(fn () => (float) $this->input('paid') > 0),
                'nullable',
                Rule::exists('accounts', 'id')->where(
                    fn ($q) => $q->where('outlet_id', OutletContext::resolvableForWrite($this->input('outlet_id')) ?? -1)
                ),
            ],
            'method' => 'nullable|string',
            'remarks' => 'nullable|string',
            'internal_note' => 'nullable|string|max:2000',
            'discount_type' => ['required', 'string', Rule::enum(DiscountType::class)],
            'discount_amount' => 'nullable|numeric|min:0',
            'delivery_charge' => 'nullable|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.productId' => 'required|exists:products,id',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
        ];
    }

    /**
     * Rejects an inline-created client's type when the invoice's own target outlet (resolved the
     * same way InvoiceService will resolve it — see OutletContext::resolvableForWrite) has that
     * type turned off. Mirrors StoreClientRequest's equivalent check; skipped entirely when this
     * invoice isn't creating a new client, since an existing client's type was already validated
     * when that client itself was created.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if (! $this->boolean('create_new_client')) {
                return;
            }

            $type = $this->input('new_client_type');
            $outletId = OutletContext::resolvableForWrite($this->input('outlet_id'));
            $outlet = $outletId ? Outlet::find($outletId) : null;

            if ($type && $outlet && ! $outlet->hasFeature($type)) {
                $validator->errors()->add('new_client_type', 'This outlet does not offer '.(OutletFeatures::CLIENT_TYPES[$type] ?? $type).'.');
            }
        });
    }
}
