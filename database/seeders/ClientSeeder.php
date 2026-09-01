<?php

namespace Database\Seeders;

use App\Enums\ClientType;
use App\Models\Client;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ClientSeeder extends Seeder
{
    public function run(): void
    {
        $clientsData = [
            ['name' => 'Ahmed Khan', 'phone' => '01711223344', 'address' => 'Banani, Dhaka'],
            ['name' => 'Sultana Razia', 'phone' => '01822334455', 'address' => 'Dhanmondi, Dhaka'],
            ['name' => 'Tanvir Islam', 'phone' => '01933445566', 'address' => 'Uttara, Dhaka'],
            ['name' => 'Maliha Akter', 'phone' => '01644556677', 'address' => 'Mirpur, Dhaka'],
        ];

        foreach ($clientsData as $data) {
            Client::firstOrCreate(['phone' => $data['phone']], $data);
        }

        $corporateClient = Client::firstOrCreate(
            ['phone' => '01555666777'],
            ['name' => 'Global Logistics Corp', 'address' => 'Gulshan 2, Dhaka', 'type' => ClientType::Corporate->value]
        );

        // Pre-configure a couple of discounted products for the corporate client.
        $corpProducts = Product::orderBy('id')->take(2)->get();
        foreach ($corpProducts as $product) {
            $corporateClient->customPrices()->firstOrCreate(
                ['product_id' => $product->id],
                ['custom_price' => round($product->price * 0.8, 2)] // 20% discount for corporate
            );
        }
    }
}
