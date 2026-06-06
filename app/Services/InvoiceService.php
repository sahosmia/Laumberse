<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Client;
use Illuminate\Support\Facades\DB;

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
                    'type' => $data['new_client_type'] ?? 'Consumer',
                    'address' => $data['new_client_address'] ?? null,
                ]);
                $clientId = $client->id;
            }

            $invoice = Invoice::create([
                'invoice_uuid' => $data['invoice_uuid'],
                'outlet_id' => $data['outlet_id'],
                'date' => $data['date'],
                'client_id' => $clientId,
                'total' => $data['total'],
                'paid' => $data['paid'],
                'due' => $data['due'],
                'status' => $data['status'],
                'method' => $data['method'],
                'remarks' => $data['remarks'] ?? null,
                'discount_type' => $data['discount_type'],
                'discount_amount' => $data['discount_amount'],
            ]);

            foreach ($data['items'] as $item) {
                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'product_id' => $item['productId'],
                    'qty' => $item['qty'],
                    'price' => $item['price'],
                ]);
            }

            // Update client stats
            $client = Client::find($clientId);
            $client->increment('total_orders');
            $client->increment('total_paid', $data['paid']);
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

            // Update Invoice
            $invoice->update([
                'invoice_uuid' => $data['invoice_uuid'],
                'outlet_id' => $data['outlet_id'],
                'date' => $data['date'],
                'client_id' => $data['client_id'],
                'total' => $data['total'],
                'paid' => $data['paid'],
                'due' => $data['due'],
                'status' => $data['status'],
                'method' => $data['method'],
                'remarks' => $data['remarks'] ?? null,
                'discount_type' => $data['discount_type'],
                'discount_amount' => $data['discount_amount'],
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
            $newClient = Client::find($data['client_id']);
            if ($newClient) {
                $newClient->increment('total_orders');
                $newClient->increment('total_paid', $data['paid']);
                $newClient->increment('total_due', $data['due']);
            }

            return $invoice;
        });
    }
}
