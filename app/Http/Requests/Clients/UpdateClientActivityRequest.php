<?php

namespace App\Http\Requests\Clients;

use Illuminate\Support\Arr;

/**
 * An activity's outlet is fixed at creation — same reasoning as UpdateInvoiceRequest.
 * `scheduled_at` also drops the "can't be in the past" rule: editing an activity that has already
 * happened (adding a note, marking it done/cancelled) is normal and must stay allowed.
 */
class UpdateClientActivityRequest extends StoreClientActivityRequest
{
    public function rules(): array
    {
        return array_merge(
            Arr::except(parent::rules(), ['outlet_id']),
            ['scheduled_at' => 'required|date'],
        );
    }
}
