<?php

namespace App\Http\Requests\Invoices;

use App\Enums\InvoiceStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class CancelInvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** No input fields — cancelling is a single confirmed action, not a form. */
    public function rules(): array
    {
        return [];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ($this->route('invoice')?->status === InvoiceStatus::BadOrder) {
                $validator->errors()->add('status', 'This invoice is already marked Bad Order.');
            }
        });
    }
}
