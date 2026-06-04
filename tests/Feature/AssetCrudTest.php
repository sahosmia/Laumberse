<?php

namespace Tests\Feature;

use App\Models\Asset;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AssetCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_asset()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('assets.store'), [
            'name' => 'Washing Machine',
            'code' => 'WM-001',
            'purchase_date' => '2023-01-01',
            'cost' => 50000,
            'current_value' => 45000,
            'status' => 'Active',
        ]);

        $response->assertStatus(302);
        $this->assertDatabaseHas('assets', [
            'name' => 'Washing Machine',
            'code' => 'WM-001',
        ]);
    }
}
