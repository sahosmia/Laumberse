<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Client;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClientCorporatePricingTest extends TestCase
{
    use RefreshDatabase;

    public function test_corporate_client_can_be_created_with_custom_prices()
    {
        $user = User::factory()->create();
        $category = Category::create(['name' => 'C1', 'slug' => 'c1']);
        $product = Product::create([
            'name' => 'Test Product',
            'price' => 100,
            'category_id' => $category->id,
        ]);

        $response = $this->actingAs($user)->post(route('clients.store'), [
            'name' => 'Corporate Client',
            'phone' => '123456789',
            'type' => 'Corporate',
            'custom_prices' => [
                [
                    'product_id' => $product->id,
                    'custom_price' => 80.50,
                ]
            ]
        ]);

        $response->assertStatus(302);
        $this->assertDatabaseHas('clients', ['name' => 'Corporate Client', 'type' => 'Corporate']);
        $this->assertDatabaseHas('customer_product_prices', [
            'custom_price' => 80.50,
            'product_id' => $product->id,
        ]);
    }

    public function test_corporate_client_prices_can_be_updated()
    {
        $user = User::factory()->create();
        $category = Category::create(['name' => 'C1', 'slug' => 'c1']);
        $client = Client::create(['name' => 'Corp', 'phone' => '123', 'type' => 'Corporate']);
        $product = Product::create(['name' => 'P1', 'price' => 100, 'category_id' => $category->id]);
        $client->customPrices()->create(['product_id' => $product->id, 'custom_price' => 90]);

        $response = $this->actingAs($user)->put(route('clients.update', $client->id), [
            'name' => 'Corp Updated',
            'phone' => '123',
            'type' => 'Corporate',
            'custom_prices' => [
                [
                    'product_id' => $product->id,
                    'custom_price' => 75.00,
                ]
            ]
        ]);

        $response->assertStatus(302);
        $this->assertDatabaseHas('customer_product_prices', [
            'customer_id' => $client->id,
            'custom_price' => 75.00,
        ]);
        $this->assertDatabaseMissing('customer_product_prices', ['custom_price' => 90]);
    }
}
