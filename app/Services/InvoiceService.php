<?php

namespace App\Services;

use App\Enums\ClientType;
use App\Enums\PaymentStatus;
use App\Models\Account;
use App\Models\Client;
use App\Models\Invoice;
use App\Models\InvoiceHistory;
use App\Models\InvoiceItem;
use App\Models\Product;
use App\Support\OutletContext;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class InvoiceService
{
    public function __construct(protected AccountService $accountService) {}

    public function createInvoice(array $data)
    {
        return DB::transaction(function () use ($data) {
            $clientId = $data['client_id'] ?? null;

            if (! empty($data['create_new_client'])) {
                $client = Client::create([
                    'name' => $data['new_client_name'],
                    'phone' => $data['new_client_phone'],
                    'address' => $data['new_client_address'] ?? null,
                    'type' => $data['new_client_type'] ?? ClientType::Consumer->value,
                ]);
                $client->update(['client_uuid' => 'CLT-'.str_pad((string) $client->id, 4, '0', STR_PAD_LEFT)]);
                $clientId = $client->id;

                // If it's a corporate client, save the items as their custom prices
                if ($client->type === ClientType::Corporate) {
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

            $isCorporate = $client?->type === ClientType::Corporate;
            $deliveryCharge = (! $isCorporate && ! empty($data['delivery_charge'])) ? (float) $data['delivery_charge'] : 0.00;
            $paymentStatus = $data['due'] <= 0 ? PaymentStatus::Paid : PaymentStatus::Unpaid;
            $paid = (float) ($data['paid'] ?? 0);
            // Only required once something's actually being paid — an invoice created fully
            // unpaid doesn't need a payment account yet (see StoreInvoiceRequest).
            $account = ! empty($data['account_id']) ? Account::findOrFail($data['account_id']) : null;

            $invoice = Invoice::create([
                // Temporary placeholder to satisfy the NOT NULL/unique constraint until the
                // auto-increment id is known, then replaced below with the serial number.
                'invoice_uuid' => (string) Str::uuid(),
                'outlet_id' => OutletContext::resolveForWrite($data['outlet_id'] ?? null),
                'date' => $data['date'],
                'client_id' => $clientId,
                'account_id' => $account?->id,
                'total' => $data['total'],
                'paid' => $paid,
                'due' => $data['due'],
                'status' => $data['status'],
                'method' => $account->name ?? '',
                'remarks' => $data['remarks'] ?? null,
                'internal_note' => $data['internal_note'] ?? null,
                'discount_type' => $data['discount_type'],
                'discount_amount' => $data['discount_amount'] ?? 0,
                'delivery_charge' => $deliveryCharge,
                'payment_status' => $paymentStatus,
                'payment_date' => $paymentStatus === PaymentStatus::Paid ? $data['date'] : null,
            ]);

            $invoice->update(['invoice_uuid' => 'INV-'.str_pad((string) $invoice->id, 4, '0', STR_PAD_LEFT)]);

            foreach ($data['items'] as $item) {
                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'product_id' => $item['productId'],
                    'qty' => $item['qty'],
                    'price' => $item['price'],
                ]);
            }

            if ($paid > 0 && $account) {
                $this->accountService->recordTransaction(
                    $account,
                    'credit',
                    $paid,
                    'Invoice payment - '.$invoice->invoice_uuid,
                    $invoice
                );
            }

            // Update client stats
            $client->increment('total_orders');
            $client->increment('total_paid', $paid);
            $client->increment('total_due', $data['due']);

            $this->recordHistory($invoice, 'created');

            return $invoice;
        });
    }

    public function updateInvoice(Invoice $invoice, array $data)
    {
        return DB::transaction(function () use ($invoice, $data) {
            $before = $this->snapshotFields($invoice);
            $itemsBefore = $this->snapshotItems($invoice);

            // Revert client stats
            $oldClient = Client::find($invoice->client_id);
            if ($oldClient) {
                $oldClient->decrement('total_orders');
                $oldClient->decrement('total_paid', $invoice->paid);
                $oldClient->decrement('total_due', $invoice->due);
            }

            // Void whatever this invoice previously credited so the new payment amount/account
            // (below) starts from a clean slate instead of double-counting.
            $this->accountService->reverseTransactionsFor($invoice);

            $newClient = Client::find($data['client_id']);
            $isCorporate = $newClient?->type === ClientType::Corporate;
            $deliveryCharge = (! $isCorporate && ! empty($data['delivery_charge'])) ? (float) $data['delivery_charge'] : 0.00;
            $paid = (float) ($data['paid'] ?? 0);
            // Only required once something's actually being paid — see UpdateInvoiceRequest.
            $account = ! empty($data['account_id']) ? Account::findOrFail($data['account_id']) : null;

            // Payment status follows the recalculated due amount, same as on creation.
            // If it was already Paid and still is, keep the original payment_date rather
            // than resetting it just because an unrelated field was edited.
            $paymentStatus = $data['due'] <= 0 ? PaymentStatus::Paid : PaymentStatus::Unpaid;
            $paymentDate = $paymentStatus === PaymentStatus::Paid
                ? ($invoice->payment_status === PaymentStatus::Paid ? $invoice->payment_date : now()->toDateString())
                : null;

            // Update Invoice (invoice_uuid is immutable once assigned)
            $invoice->update([
                'date' => $data['date'],
                'client_id' => $data['client_id'],
                'account_id' => $account?->id,
                'total' => $data['total'],
                'paid' => $paid,
                'due' => $data['due'],
                'status' => $data['status'],
                'method' => $account->name ?? '',
                'remarks' => $data['remarks'] ?? null,
                'internal_note' => $data['internal_note'] ?? null,
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

            if ($paid > 0 && $account) {
                $this->accountService->recordTransaction(
                    $account,
                    'credit',
                    $paid,
                    'Invoice payment - '.$invoice->invoice_uuid,
                    $invoice
                );
            }

            // Update client stats again
            if ($newClient) {
                $newClient->increment('total_orders');
                $newClient->increment('total_paid', $paid);
                $newClient->increment('total_due', $data['due']);
            }

            $itemsAfter = $this->snapshotItemsFromInput($data['items']);
            $this->recordHistory($invoice, 'updated', $this->diffFields($before, $this->snapshotFields($invoice->fresh())), $this->diffItems($itemsBefore, $itemsAfter));

            return $invoice;
        });
    }

    public function updatePaymentStatus(Invoice $invoice, string $paymentStatus, ?int $accountId = null): Invoice
    {
        return DB::transaction(function () use ($invoice, $paymentStatus, $accountId) {
            $before = $this->snapshotFields($invoice);
            $isPaid = $paymentStatus === PaymentStatus::Paid->value;

            $oldPaid = (float) $invoice->paid;
            $oldDue = (float) $invoice->due;
            $newPaid = $isPaid ? (float) $invoice->total : 0.0;
            $newDue = $isPaid ? 0.0 : (float) $invoice->total;

            // A freshly-picked account (only possible when the invoice didn't already have one,
            // see UpdatePaymentStatusRequest) sticks on the invoice going forward; otherwise keep
            // whatever it already had.
            $account = $accountId ? Account::findOrFail($accountId) : $invoice->account;

            $invoice->update([
                'payment_status' => $isPaid ? PaymentStatus::Paid->value : PaymentStatus::Unpaid->value,
                'payment_date' => $isPaid ? now()->toDateString() : null,
                'paid' => $newPaid,
                'due' => $newDue,
                'account_id' => $account?->id ?? $invoice->account_id,
                'method' => $account->name ?? $invoice->method,
            ]);

            // Whatever this invoice previously credited to its account no longer reflects
            // reality once the paid amount changes here — void it before (maybe) recording
            // the new amount, same as updateInvoice().
            $this->accountService->reverseTransactionsFor($invoice);

            if ($newPaid > 0 && $account) {
                $this->accountService->recordTransaction(
                    $account,
                    'credit',
                    $newPaid,
                    'Invoice payment - '.$invoice->invoice_uuid,
                    $invoice
                );
            }

            if ($invoice->client) {
                $invoice->client->increment('total_paid', $newPaid - $oldPaid);
                $invoice->client->increment('total_due', $newDue - $oldDue);
            }

            $this->recordHistory($invoice, 'payment_status_changed', $this->diffFields($before, $this->snapshotFields($invoice->fresh())));

            return $invoice;
        });
    }

    public function updateStatus(Invoice $invoice, string $status): Invoice
    {
        return DB::transaction(function () use ($invoice, $status) {
            $before = $this->snapshotFields($invoice);

            $invoice->update(['status' => $status]);

            $this->recordHistory($invoice, 'status_changed', $this->diffFields($before, $this->snapshotFields($invoice->fresh())));

            return $invoice;
        });
    }

    public function deleteInvoice(Invoice $invoice): void
    {
        DB::transaction(function () use ($invoice) {
            $this->accountService->reverseTransactionsFor($invoice);

            if ($invoice->client) {
                $invoice->client->decrement('total_orders');
                $invoice->client->decrement('total_paid', $invoice->paid);
                $invoice->client->decrement('total_due', $invoice->due);
            }

            $invoice->delete();
        });
    }

    /** Field labels tracked for the edit-history diff, in display order. */
    private const HISTORY_FIELD_LABELS = [
        'date' => 'Date',
        'client_id' => 'Client',
        'account_id' => 'Payment Account',
        'total' => 'Total',
        'paid' => 'Paid',
        'due' => 'Due',
        'status' => 'Status',
        'payment_status' => 'Payment Status',
        'discount_type' => 'Discount Type',
        'discount_amount' => 'Discount Amount',
        'delivery_charge' => 'Delivery Charge',
        'remarks' => 'Remarks',
        'internal_note' => 'Internal Note',
    ];

    /** Captures the current value of every history-tracked field, before a mutation is applied. */
    private function snapshotFields(Invoice $invoice): array
    {
        return [
            'date' => $invoice->date,
            'client_id' => $invoice->client_id,
            'account_id' => $invoice->account_id,
            'total' => (float) $invoice->total,
            'paid' => (float) $invoice->paid,
            'due' => (float) $invoice->due,
            'status' => $invoice->status?->value,
            'payment_status' => $invoice->payment_status?->value,
            'discount_type' => $invoice->discount_type?->value,
            'discount_amount' => (float) $invoice->discount_amount,
            'delivery_charge' => (float) $invoice->delivery_charge,
            'remarks' => $invoice->remarks,
            'internal_note' => $invoice->internal_note,
        ];
    }

    /** @return array<int, array{product_id: int, name: string, qty: int, price: float}> */
    private function snapshotItems(Invoice $invoice): array
    {
        return $invoice->items()->with('product:id,name')->get()
            ->map(fn ($item) => [
                'product_id' => $item->product_id,
                'name' => $item->product?->name ?? "#{$item->product_id}",
                'qty' => (int) $item->qty,
                'price' => (float) $item->price,
            ])
            ->all();
    }

    /** Same shape as snapshotItems(), but built from raw form input (used before the new rows are written). */
    private function snapshotItemsFromInput(array $items): array
    {
        $productNames = Product::whereIn('id', array_column($items, 'productId'))->pluck('name', 'id');

        return array_map(fn ($item) => [
            'product_id' => (int) $item['productId'],
            'name' => $productNames[$item['productId']] ?? "#{$item['productId']}",
            'qty' => (int) $item['qty'],
            'price' => (float) $item['price'],
        ], $items);
    }

    /** @return array<int, array{field: string, label: string, old: mixed, new: mixed}> */
    private function diffFields(array $before, array $after): array
    {
        $changes = [];

        foreach (self::HISTORY_FIELD_LABELS as $field => $label) {
            $old = $before[$field] ?? null;
            $new = $after[$field] ?? null;

            if ($old == $new) { // loose: e.g. 100 vs 100.0
                continue;
            }

            if ($field === 'client_id') {
                $old = $old ? (Client::find($old)?->name ?? "#{$old}") : null;
                $new = $new ? (Client::find($new)?->name ?? "#{$new}") : null;
            } elseif ($field === 'account_id') {
                $old = $old ? (Account::find($old)?->name ?? "#{$old}") : ($before['method'] ?? null);
                $new = $new ? (Account::find($new)?->name ?? "#{$new}") : null;
            }

            $changes[] = ['field' => $field, 'label' => $label, 'old' => $old, 'new' => $new];
        }

        return $changes;
    }

    /** @return array<int, string> Human-readable one-line summaries of added/removed/changed line items. */
    private function diffItems(array $itemsBefore, array $itemsAfter): array
    {
        $before = collect($itemsBefore)->keyBy('product_id');
        $after = collect($itemsAfter)->keyBy('product_id');
        $lines = [];

        foreach ($after as $productId => $item) {
            if (! $before->has($productId)) {
                $lines[] = "Added \"{$item['name']}\" (x{$item['qty']} @ ".number_format($item['price'], 2).')';

                continue;
            }

            $old = $before[$productId];
            if ((int) $old['qty'] !== $item['qty'] || (float) $old['price'] !== $item['price']) {
                $lines[] = "\"{$item['name']}\": qty {$old['qty']} → {$item['qty']}, price ".
                    number_format($old['price'], 2).' → '.number_format($item['price'], 2);
            }
        }

        foreach ($before as $productId => $item) {
            if (! $after->has($productId)) {
                $lines[] = "Removed \"{$item['name']}\"";
            }
        }

        return $lines;
    }

    private function recordHistory(Invoice $invoice, string $action, array $fieldChanges = [], array $itemChanges = []): void
    {
        if ($action === 'updated' && empty($fieldChanges) && empty($itemChanges)) {
            // Nothing actually changed (e.g. the edit form was saved without touching anything) —
            // don't clutter the timeline with a no-op entry.
            return;
        }

        InvoiceHistory::create([
            'invoice_id' => $invoice->id,
            'user_id' => auth()->id(),
            'action' => $action,
            'changes' => ['fields' => $fieldChanges, 'items' => $itemChanges],
        ]);
    }
}
