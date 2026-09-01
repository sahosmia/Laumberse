<?php

namespace App\Actions\Invoices;

use App\Enums\ClientType;
use App\Enums\DiscountType;
use App\Enums\PaymentStatus;
use App\Models\GlobalSetting;
use App\Models\Invoice;
use Carbon\Carbon;

/**
 * Everything the invoice PDF view (resources/views/invoices/pdf.blade.php) needs, fully
 * pre-computed — the view must stay presentation-only (no model calls, no sums/discount math,
 * no @php logic blocks), so every figure, label, and color decision is resolved here instead.
 */
class PrepareInvoicePdfDataAction
{
    public function __invoke(Invoice $invoice): array
    {
        $invoice->loadMissing(['client', 'items.product']);

        $subtotal = $invoice->items->sum(fn ($item) => $item->qty * $item->price);

        return [
            'invoiceUuid' => $invoice->invoice_uuid,
            'invoiceDate' => Carbon::parse($invoice->date)->format('d M, Y'),
            'status' => $invoice->status->value,
            'method' => $invoice->method,
            'paymentStatus' => $invoice->payment_status->value,
            'paymentStatusColor' => $invoice->payment_status === PaymentStatus::Paid ? '#059669' : '#dc2626',
            'business' => $this->business(),
            'client' => [
                'name' => $invoice->client->name,
                'phone' => $invoice->client->phone,
                'address' => $invoice->client->address,
            ],
            'items' => $invoice->items->map(fn ($item) => [
                'productName' => $item->product->name,
                'productInitial' => mb_strtoupper(mb_substr($item->product->name, 0, 1, 'UTF-8')),
                'productImagePath' => $item->product->image ? public_path('storage/'.$item->product->image) : null,
                'qty' => $item->qty,
                'priceFormatted' => number_format($item->price, 2),
                'amountFormatted' => number_format($item->qty * $item->price, 2),
            ])->all(),
            'subtotalFormatted' => number_format($subtotal, 2),
            'discount' => $this->discount($invoice, $subtotal),
            'showDeliveryCharge' => (float) $invoice->delivery_charge !== 0.0 && $invoice->client->type !== ClientType::Corporate,
            'deliveryChargeFormatted' => number_format($invoice->delivery_charge, 2),
            'paidFormatted' => number_format($invoice->paid, 2),
            'totalFormatted' => number_format($invoice->total, 2),
            'remarks' => $invoice->remarks,
            'generatedAt' => now()->format('Y-m-d H:i:s'),
        ];
    }

    private function business(): array
    {
        $logoPath = GlobalSetting::get('logo_path');

        return [
            'logoPath' => $logoPath ? storage_path('app/public/'.$logoPath) : null,
            'name' => GlobalSetting::get('business_name') ?: 'Launverse',
            'address' => GlobalSetting::get('business_address'),
            'phone' => GlobalSetting::get('business_phone'),
        ];
    }

    /** Null when there's no discount to show — the view just checks for that instead of re-deriving it. */
    private function discount(Invoice $invoice, float $subtotal): ?array
    {
        if ((float) $invoice->discount_amount === 0.0) {
            return null;
        }

        $isPercentage = $invoice->discount_type === DiscountType::Percentage;
        $value = $isPercentage ? ($subtotal * $invoice->discount_amount) / 100 : (float) $invoice->discount_amount;

        return [
            'label' => $isPercentage
                ? "Discount (Percentage {$invoice->discount_amount}%)"
                : "Discount ({$invoice->discount_type->value})",
            'valueFormatted' => number_format($value, 2),
        ];
    }
}
