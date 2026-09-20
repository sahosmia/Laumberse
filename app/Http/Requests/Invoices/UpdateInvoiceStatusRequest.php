<?php

namespace App\Http\Requests\Invoices;

use App\Enums\InvoiceStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateInvoiceStatusRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            // BadOrder is deliberately excluded — only InvoiceService::cancelOrder() may set it,
            // since it also reverses any paid amount and flips payment_status. Allowing it here
            // would change the status with none of those side effects.
            'status' => ['required', 'string', Rule::in(InvoiceStatus::formValues())],
        ];
    }

    /** An already-cancelled invoice is locked out of the normal pipeline — see rules() above. */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ($this->route('invoice')?->status === InvoiceStatus::BadOrder) {
                $validator->errors()->add('status', 'This invoice is marked Bad Order and can no longer be moved through the pipeline.');
            }
        });
    }
}
