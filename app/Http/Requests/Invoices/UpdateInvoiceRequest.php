<?php

namespace App\Http\Requests\Invoices;

use App\Enums\DiscountType;
use App\Enums\InvoiceStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateInvoiceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date' => 'required|date',
            'client_id' => 'required|exists:clients,id',
            'total' => 'required|numeric|min:0',
            'paid' => 'nullable|numeric|min:0',
            'due' => 'required|numeric',
            'status' => ['required', 'string', Rule::in(InvoiceStatus::formValues())],
            'method' => 'required|string|in:Cash,Bkash,Bank',
            'remarks' => 'nullable|string',
            'discount_type' => ['required', 'string', Rule::enum(DiscountType::class)],
            'discount_amount' => 'nullable|numeric|min:0',
            'delivery_charge' => 'nullable|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.productId' => 'required|exists:products,id',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
        ];
    }
}
