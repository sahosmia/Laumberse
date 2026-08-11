<?php

namespace App\Http\Requests\Invoices;

use App\Enums\ClientType;
use App\Enums\DiscountType;
use App\Enums\InvoiceStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreInvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
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
