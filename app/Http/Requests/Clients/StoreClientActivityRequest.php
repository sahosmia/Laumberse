<?php

namespace App\Http\Requests\Clients;

use App\Support\OutletContext;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
            'type' => 'required|in:meeting,follow_up',
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
}
