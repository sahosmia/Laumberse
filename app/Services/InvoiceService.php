<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Client;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class InvoiceService
{
    public function createInvoice(array $data)
    {
        return DB::transaction(function () use ($data) {
            $clientId = $data['client_id'] ?? null;

            if (!empty($data['create_new_client'])) {
                $client = Client::create([
                    'name' => $data['new_client_name'],
                    'phone' => $data['new_client_phone'],
                    'address' => $data['new_client_address'] ?? null,
                    'type' => $data['new_client_type'] ?? 'Consumer',
                ]);
                $client->update(['client_uuid' => 'CLT-' . str_pad((string) $client->id, 4, '0', STR_PAD_LEFT)]);
                $clientId = $client->id;

                // If it's a corporate client, save the items as their custom prices
                if ($client->type === 'Corporate') {
                    foreach ($data['items'] as $item) {
                        DB::table('customer_product_prices')->insert([
                            'customer_id' => $client->id,
                            'product_id' => $item['productId'],
                            'custom_price' => $item['price'],
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }
            } else {
                $client = Client::find($clientId);
            }

            $isCorporate = $client?->type === 'Corporate';
            $deliveryCharge = (!$isCorporate && !empty($data['delivery_charge'])) ? (float)$data['delivery_charge'] : 0.00;
            $paymentStatus = $data['due'] <= 0 ? 'Paid' : 'Unpaid';
            $paid = $data['paid'] ?? 0;

            $invoice = Invoice::create([
                // Temporary placeholder to satisfy the NOT NULL/unique constraint until the
                // auto-increment id is known, then replaced below with the serial number.
                'invoice_uuid' => (string) Str::uuid(),
                'date' => $data['date'],
                'client_id' => $clientId,
                'total' => $data['total'],
                'paid' => $paid,
                'due' => $data['due'],
                'status' => $data['status'],
                'method' => $data['method'],
                'remarks' => $data['remarks'] ?? null,
                'discount_type' => $data['discount_type'],
                'discount_amount' => $data['discount_amount'] ?? 0,
                'delivery_charge' => $deliveryCharge,
                'payment_status' => $paymentStatus,
                'payment_date' => $paymentStatus === 'Paid' ? $data['date'] : null,
            ]);

            $invoice->update(['invoice_uuid' => 'INV-' . str_pad((string) $invoice->id, 4, '0', STR_PAD_LEFT)]);

            foreach ($data['items'] as $item) {
                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'product_id' => $item['productId'],
                    'qty' => $item['qty'],
                    'price' => $item['price'],
                ]);
            }

            // Update client stats
            $client->increment('total_orders');
            $client->increment('total_paid', $paid);
            $client->increment('total_due', $data['due']);

            return $invoice;
        });
    }

    public function updateInvoice(Invoice $invoice, array $data)
    {
        return DB::transaction(function () use ($invoice, $data) {
            // Revert client stats
            $oldClient = Client::find($invoice->client_id);
            if ($oldClient) {
                $oldClient->decrement('total_orders');
                $oldClient->decrement('total_paid', $invoice->paid);
                $oldClient->decrement('total_due', $invoice->due);
            }

            $newClient = Client::find($data['client_id']);
            $isCorporate = $newClient?->type === 'Corporate';
            $deliveryCharge = (!$isCorporate && !empty($data['delivery_charge'])) ? (float)$data['delivery_charge'] : 0.00;
            $paid = $data['paid'] ?? 0;

            // Payment status follows the recalculated due amount, same as on creation.
            // If it was already Paid and still is, keep the original payment_date rather
            // than resetting it just because an unrelated field was edited.
            $paymentStatus = $data['due'] <= 0 ? 'Paid' : 'Unpaid';
            $paymentDate = $paymentStatus === 'Paid'
                ? ($invoice->payment_status === 'Paid' ? $invoice->payment_date : now()->toDateString())
                : null;

            // Update Invoice (invoice_uuid is immutable once assigned)
            $invoice->update([
                'date' => $data['date'],
                'client_id' => $data['client_id'],
                'total' => $data['total'],
                'paid' => $paid,
                'due' => $data['due'],
                'status' => $data['status'],
                'method' => $data['method'],
                'remarks' => $data['remarks'] ?? null,
                'discount_type' => $data['discount_type'],
                'discount_amount' => $data['discount_amount'] ?? 0,
                'delivery_charge' => $deliveryCharge,
                'payment_status' => $paymentStatus,
                'payment_date' => $paymentDate,
            ]);

            // Delete old items
            $invoice->items()->delete();

            // Create new items
            foreach ($data['items'] as $item) {
                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'product_id' => $item['productId'],
                    'qty' => $item['qty'],
                    'price' => $item['price'],
                ]);
            }

            // Update client stats again
            if ($newClient) {
                $newClient->increment('total_orders');
                $newClient->increment('total_paid', $paid);
                $newClient->increment('total_due', $data['due']);
            }

            return $invoice;
        });
    }

    public function updatePaymentStatus(Invoice $invoice, string $paymentStatus): Invoice
    {
        return DB::transaction(function () use ($invoice, $paymentStatus) {
            $isPaid = $paymentStatus === 'Paid';

            $oldPaid = (float) $invoice->paid;
            $oldDue = (float) $invoice->due;
            $newPaid = $isPaid ? (float) $invoice->total : 0.0;
            $newDue = $isPaid ? 0.0 : (float) $invoice->total;

            $invoice->update([
                'payment_status' => $isPaid ? 'Paid' : 'Unpaid',
                'payment_date' => $isPaid ? now()->toDateString() : null,
                'paid' => $newPaid,
                'due' => $newDue,
            ]);

            if ($invoice->client) {
                $invoice->client->increment('total_paid', $newPaid - $oldPaid);
                $invoice->client->increment('total_due', $newDue - $oldDue);
            }

            return $invoice;
        });
    }
}
