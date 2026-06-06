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
        // Get or create an outlet to map invoices to
        $outlet = Outlet::first() ?? Outlet::create(['name' => 'Main Outlet', 'location' => 'Dhaka']);

        // Check if products exist; if not, create a baseline matching your main list
        if (Product::count() === 0) {
            $categories = ['Gents Item', 'Ladies Item', 'Kids Item', 'Household Item', 'Others Item'];
            $categoryModels = [];

            foreach ($categories as $cat) {
                $categoryModels[$cat] = Category::firstOrCreate([
                    'name' => $cat,
                ], [
                    'slug' => strtolower(str_replace(' ', '-', $cat)),
                    'description' => $cat . ' category',
                ]);
            }

            $productsData = [
                ['name' => 'Shirt (শার্ট)', 'category' => 'Gents Item', 'price' => 15],
                ['name' => 'Jeans Pant (জিন্স প্যান্ট)', 'category' => 'Gents Item', 'price' => 25],
                ['name' => 'Panjabi Silk (পাঞ্জাবি সিল্ক)', 'category' => 'Gents Item', 'price' => 40],
                ['name' => 'Kameez / Kurti (কামিজ / কুর্তি)', 'category' => 'Ladies Item', 'price' => 30],
                ['name' => '3 Piece Normal (৩ পিস সাধারণ)', 'category' => 'Ladies Item', 'price' => 60],
                ['name' => 'Blanket Large (কম্বল বড়)', 'category' => 'Household Item', 'price' => 150],
            ];

            foreach ($productsData as $p) {
                Product::create([
                    'name' => $p['name'],
                    'category_id' => $categoryModels[$p['category']]->id,
                    'price' => $p['price'],
                ]);
            }
        }

        // Fetch all current products
        $productModels = Product::all();

        // Safe guard if no products exist anywhere to prevent random() from crashing
        if ($productModels->isEmpty()) {
            return;
        }

        // Generate Demo Clients
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
        $corpProducts = $productModels->take(2);
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


        // Generate realistic transaction/invoice data
        foreach ($clientModels as $client) {
            $numInvoices = rand(2, 5);

            for ($i = 0; $i < $numInvoices; $i++) {
                $total = 0;
                $items = [];
                $numItems = rand(1, min(4, $productModels->count()));

                $invoiceId = 'INV-' . date('Ymd') . rand(1000, 9999);

                // Select random products for this specific invoice
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

                // Determine dynamic split parameters for partial vs full payments
                $paid = (rand(0, 10) > 7) ? rand(floor($total * 0.5), $total) : $total;
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

                // Smooth execution of mass increment statements per client file
                $client->increment('total_orders');
                $client->increment('total_paid', $paid);
                $client->increment('total_due', $due);
            }
        }
    }
}
