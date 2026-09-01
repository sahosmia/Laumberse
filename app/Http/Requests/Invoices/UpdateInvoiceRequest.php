<?php

namespace App\Http\Requests\Invoices;

use Illuminate\Support\Arr;
use Illuminate\Validation\Rule;

/**
 * Reuses every rule from StoreInvoiceRequest except the ones specific to creating a brand new
 * invoice. `client_id` becomes a flat "must already exist" requirement — there's no
 * create-new-client-inline flow on edit (see invoice-form.tsx, where that whole section is
 * wrapped in `{!isEdit && (...)}`) — and `create_new_client`/`new_client_*` aren't validated at
 * all, matching this class's original, narrower rule set exactly. `authorize()` is inherited
 * unchanged from StoreInvoiceRequest (both simply return true).
 *
 * `outlet_id` is dropped entirely — an invoice's outlet is fixed at creation
 * (InvoiceService::updateInvoice() never touches it), so there's nothing here to validate.
 * `account_id` is also overridden rather than inherited as-is: StoreInvoiceRequest's version
 * checks against OutletContext::resolvableForWrite(), which is meant for a brand-new record and
 * would wrongly check the *editor's own current outlet* instead of this invoice's fixed one.
 */
class UpdateInvoiceRequest extends StoreInvoiceRequest
{
    public function rules(): array
    {
        $invoice = $this->route('invoice');

        return array_merge(
            Arr::except(parent::rules(), [
                'outlet_id',
                'client_id',
                'create_new_client',
                'new_client_name',
                'new_client_phone',
                'new_client_address',
                'new_client_type',
            ]),
            [
                'client_id' => 'required|exists:clients,id',
                'account_id' => [
                    Rule::requiredIf(fn () => (float) $this->input('paid') > 0),
                    'nullable',
                    Rule::exists('accounts', 'id')->where(fn ($q) => $q->where('outlet_id', $invoice?->outlet_id ?? -1)),
                ],
            ],
        );
    }
}
