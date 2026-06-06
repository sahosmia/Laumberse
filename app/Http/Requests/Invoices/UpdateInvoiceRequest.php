<?php

namespace App\Http\Requests\Invoices;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

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
            'invoice_uuid' => 'required|string|unique:invoices,invoice_uuid,' . $this->route('invoice')->id,
            'outlet_id' => [
                'nullable',
                'exists:outlets,id',
                function ($attribute, $value, $fail) {
                    $client = \App\Models\Client::find($this->input('client_id'));
                    if ($client?->type !== 'Corporate' && empty($value)) {
                        $fail('The outlet field is required for consumer clients.');
                    }
                },
            ],
            'date' => 'required|date',
            'client_id' => 'required|exists:clients,id',
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
