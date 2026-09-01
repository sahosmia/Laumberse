<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Services\ClientActivityService;
use Illuminate\Database\Seeder;

class ClientActivitySeeder extends Seeder
{
    public function run(): void
    {
        $client = Client::where('phone', '01555666777')->first(); // Global Logistics Corp

        if (! $client || $client->activities()->exists()) {
            return;
        }

        app(ClientActivityService::class)->logActivity($client, [
            'type' => 'meeting',
            'scheduled_at' => now()->subDays(3)->format('Y-m-d H:i:s'),
            'note' => 'Discussed renewing the corporate laundry contract for next quarter.',
            'next_follow_up_date' => now()->addWeek()->format('Y-m-d'),
        ]);
    }
}
