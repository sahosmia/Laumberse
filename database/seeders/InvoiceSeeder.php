<?php

namespace Database\Seeders;

use App\Enums\InvoiceStatus;
use App\Models\Client;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class InvoiceSeeder extends Seeder
{
    public function run(): void
    {
        // Randomized demo data — only generate once, not idempotent per-row like the other seeders.
        if (Invoice::count() > 0) {
            return;
        }

        $productModels = Product::all();
        $clientModels = Client::all();

        if ($productModels->isEmpty() || $clientModels->isEmpty()) {
            return;
        }

        foreach ($clientModels as $client) {
            $numInvoices = rand(2, 5);

            for ($i = 0; $i < $numInvoices; $i++) {
                $total = 0;
                $items = [];
                $numItems = rand(1, min(4, $productModels->count()));
                $selectedProducts = $productModels->random($numItems);

                foreach ($selectedProducts as $prod) {
                    $qty = rand(1, 3);
                    $price = $prod->price;
                    $total += $qty * $price;

                    $items[] = [
                        'product_id' => $prod->id,
                        'qty' => $qty,
                        'price' => $price,
                    ];
                }

                $paid = (rand(0, 10) > 7) ? rand((int) floor($total * 0.5), (int) $total) : $total;
                $due = $total - $paid;

                $invoice = Invoice::create([
                    'invoice_uuid' => (string) Str::uuid(),
                    'date' => date('Y-m-d', strtotime('-'.rand(0, 60).' days')),
                    'client_id' => $client->id,
                    'total' => $total,
                    'paid' => $paid,
                    'due' => $due,
                    'status' => ($due > 0) ? InvoiceStatus::Processing->value : InvoiceStatus::Delivered->value,
                    'method' => ['Cash', 'Bkash', 'Bank'][rand(0, 2)],
                ]);

                $invoice->update(['invoice_uuid' => 'INV-'.str_pad((string) $invoice->id, 4, '0', STR_PAD_LEFT)]);

                foreach ($items as $item) {
                    $item['invoice_id'] = $invoice->id;
                    InvoiceItem::create($item);
                }

                $client->increment('total_orders');
                $client->increment('total_paid', $paid);
                $client->increment('total_due', $due);
            }
        }
    }
}
