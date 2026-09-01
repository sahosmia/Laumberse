<?php

namespace App\Http\Requests\Invoices;

use App\Enums\PaymentStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePaymentStatusRequest extends FormRequest
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
        $invoice = $this->route('invoice');
        $markingPaid = $this->input('payment_status') === PaymentStatus::Paid->value;
        // An invoice that already has a payment account keeps reusing it; one that doesn't
        // (e.g. created fully unpaid, see StoreInvoiceRequest) needs one picked before it can
        // be marked Paid, so we know which account to credit.
        $needsAccount = $markingPaid && ! $invoice?->account_id;

        return [
            'payment_status' => ['required', 'string', Rule::enum(PaymentStatus::class)],
            // Must belong to this invoice's own outlet — it's already fixed at creation, unlike a
            // new record's outlet_id, which is why this checks $invoice->outlet_id directly rather
            // than OutletContext::resolvableForWrite().
            'account_id' => [
                Rule::requiredIf($needsAccount),
                'nullable',
                Rule::exists('accounts', 'id')->where(fn ($q) => $q->where('outlet_id', $invoice?->outlet_id ?? -1)),
            ],
        ];
    }
}
