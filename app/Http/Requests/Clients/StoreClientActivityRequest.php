<?php

namespace App\Http\Requests\Clients;

use App\Support\OutletContext;
use App\Support\OutletFeatures;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreClientActivityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Only meaningful for a switch-capable user currently viewing "All Outlets" — see
            // App\Support\OutletContext::resolveForWrite.
            'outlet_id' => [
                Rule::requiredIf(fn () => OutletContext::isAll()),
                'nullable',
                Rule::exists('outlets', 'id')->where('status', 'active'),
            ],
            'type' => ['required', Rule::in(array_keys(OutletFeatures::ACTIVITIES))],
            // A new meeting/follow-up can't be scheduled in the past — only applies on create;
            // UpdateClientActivityRequest deliberately doesn't repeat this, since editing an
            // already-past activity (e.g. adding a note, marking it done) is normal.
            'scheduled_at' => 'required|date|after_or_equal:now',
            'note' => 'nullable|string|max:1000',
            'employee_id' => 'nullable|exists:employees,id',
            'status' => 'nullable|in:pending,done,cancelled',
            'next_follow_up_date' => 'nullable|date|after_or_equal:scheduled_at',
            'reminder_minutes' => 'nullable|integer|in:15,30,60,1440',
        ];
    }

    /**
     * Rejects a type the target outlet has turned off (see Outlet::hasFeature). Needs both
     * outlet_id and type resolved together, so it runs after the field rules above rather than as
     * a per-field rule — resolvableForWrite() returns null only when neither is resolvable yet, in
     * which case the outlet_id rule above already reports the real error.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $type = $this->input('type');
            $outletId = OutletContext::resolvableForWrite($this->input('outlet_id'));

            if ($type && $outletId !== null && ! OutletContext::featureEnabledFor($outletId, $type)) {
                $validator->errors()->add('type', 'This outlet does not have '.(OutletFeatures::ACTIVITIES[$type] ?? $type).' enabled.');
            }
        });
    }
}
