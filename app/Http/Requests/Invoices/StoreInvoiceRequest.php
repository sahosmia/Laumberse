<?php

namespace App\Http\Requests\Invoices;

use Illuminate\Foundation\Http\FormRequest;

class StoreInvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'invoice_uuid' => 'required|string|unique:invoices,invoice_uuid',
            'outlet_id' => 'required|exists:outlets,id',
            'date' => 'required|date',
            'client_id' => 'required_without:create_new_client|required_if:create_new_client,false|nullable|exists:clients,id',
            'create_new_client' => 'boolean',
            'new_client_name' => 'required_if:create_new_client,true|nullable|string|max:255',
            'new_client_phone' => 'required_if:create_new_client,true|nullable|string|max:255',
            'new_client_type' => 'required_if:create_new_client,true|nullable|string|in:Consumer,Corporate',
            'new_client_address' => 'nullable|string|max:255',
            'total' => 'required|numeric|min:0',
            'paid' => 'required|numeric|min:0',
            'due' => 'required|numeric',
            'status' => 'required|string|in:Processing,In House,Delivered',
            'method' => 'required|string|in:Cash,Bkash,Bank',
            'remarks' => 'nullable|string',
            'discount_type' => 'required|string|in:Fixed,Percentage',
            'discount_amount' => 'required|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.productId' => 'required|exists:products,id',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
        ];
    }
}
