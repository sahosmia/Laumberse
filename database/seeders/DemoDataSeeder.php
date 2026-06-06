<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Invoice;
use App\Models\Outlet;
use App\Models\Product;
use App\Models\Category;
use App\Models\InvoiceItem;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $outlet = Outlet::first() ?? Outlet::create(['name' => 'Main Outlet', 'location' => 'Dhaka']);

        $productModels = Product::all()->toArray();
        if (empty($productModels)) {
             $categories = ['Gents', 'Ladies', 'Kids', 'Household', 'Others'];
            $categoryModels = [];
            foreach ($categories as $cat) {
                $categoryModels[$cat] = Category::firstOrCreate([
                    'name' => $cat,
                ], [
                    'slug' => strtolower($cat),
                    'description' => $cat . ' category',
                ]);
            }

            $productsData = [
                ['name' => 'Cotton Shirt', 'category' => 'Gents', 'price' => 25],
                ['name' => 'Jeans Pant', 'category' => 'Gents', 'price' => 35],
                ['name' => 'Silk Panjabi', 'category' => 'Gents', 'price' => 50],
                ['name' => 'Salwar Kameez', 'category' => 'Ladies', 'price' => 45],
            ];

            foreach ($productsData as $p) {
                Product::create([
                    'name' => $p['name'],
                    'category_id' => $categoryModels[$p['category']]->id,
                    'price' => $p['price'],
                ]);
            }
            $productModels = Product::all();
        } else {
            $productModels = Product::all();
        }

        $clientsData = [
            ['name' => 'Ahmed Khan', 'phone' => '01711223344', 'address' => 'Banani, Dhaka'],
            ['name' => 'Sultana Razia', 'phone' => '01822334455', 'address' => 'Dhanmondi, Dhaka'],
            ['name' => 'Tanvir Islam', 'phone' => '01933445566', 'address' => 'Uttara, Dhaka'],
            ['name' => 'Maliha Akter', 'phone' => '01644556677', 'address' => 'Mirpur, Dhaka'],
        ];

        $clientModels = [];
        foreach ($clientsData as $c) {
            $clientModels[] = Client::create($c);
        }

        // Add a Corporate Client with pre-configured products and custom prices
        $corporateClient = Client::create([
            'name' => 'Global Logistics Corp',
            'phone' => '01555666777',
            'address' => 'Gulshan 2, Dhaka',
            'type' => 'Corporate'
        ]);

        // Pre-configure some products for the corporate client
        $corpProducts = collect($productModels)->take(2);
        foreach ($corpProducts as $product) {
            DB::table('customer_product_prices')->insert([
                'customer_id' => $corporateClient->id,
                'product_id' => $product->id,
                'custom_price' => $product->price * 0.8, // 20% discount for corporate
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $clientModels[] = $corporateClient;

        // Generate some realistic invoices
        foreach ($clientModels as $client) {
            $numInvoices = rand(2, 5);
            for ($i = 0; $i < $numInvoices; $i++) {
                $total = 0;
                $items = [];
                $numItems = rand(1, min(4, $productModels->count()));

                $invoiceId = 'INV-' . date('Ymd') . rand(1000, 9999);

                // Select random products for the invoice
                $selectedProducts = $productModels->random($numItems);

                foreach ($selectedProducts as $prod) {
                    $qty = rand(1, 3);
                    $price = $prod->price;
                    $total += $qty * $price;
                    $items[] = [
                        'product_id' => $prod->id,
                        'qty' => $qty,
                        'price' => $price
                    ];
                }

                $paid = (rand(0, 10) > 7) ? rand($total * 0.5, $total) : $total;
                $due = $total - $paid;

                $invoice = Invoice::create([
                    'invoice_uuid' => $invoiceId,
                    'outlet_id' => $outlet->id,
                    'date' => date('Y-m-d', strtotime("-" . rand(0, 60) . " days")),
                    'client_id' => $client->id,
                    'total' => $total,
                    'paid' => $paid,
                    'due' => $due,
                    'status' => ($due > 0) ? 'Processing' : 'Delivered',
                    'method' => ['Cash', 'Bkash', 'Bank'][rand(0, 2)],
                ]);

                foreach ($items as $item) {
                    $item['invoice_id'] = $invoice->id;
                    InvoiceItem::create($item);
                }

                // Update client stats
                $client->increment('total_orders');
                $client->increment('total_paid', $paid);
                $client->increment('total_due', $due);
            }
        }
    }
}
