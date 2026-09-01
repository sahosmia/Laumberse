<?php

namespace App\Http\Requests\Finance;

use App\Support\OutletContext;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCompanyLoanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'lender_name' => 'required|string|max:255',
            'initial_loan_amount' => 'required|numeric|min:0',
            // Only meaningful for a switch-capable user currently viewing "All Outlets" — see
            // App\Support\OutletContext::resolveForWrite. Required only when there's actually an
            // initial amount to attribute to an outlet.
            'outlet_id' => [
                Rule::requiredIf(fn () => OutletContext::isAll() && (float) $this->input('initial_loan_amount') > 0),
                'nullable',
                Rule::exists('outlets', 'id')->where('status', 'active'),
            ],
        ];
    }
}
