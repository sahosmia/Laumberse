<?php

namespace App\Actions\Clients;

use App\Enums\ClientType;
use App\Models\Client;
use Illuminate\Support\Facades\DB;

class CreateClientAction
{
    public function __invoke(array $data): Client
    {
        return DB::transaction(function () use ($data) {
            $client = Client::create($data);
            $client->update(['client_uuid' => 'CLT-' . str_pad((string) $client->id, 4, '0', STR_PAD_LEFT)]);

            if ($data['type'] === ClientType::Corporate->value && !empty($data['custom_prices'])) {
                foreach ($data['custom_prices'] as $priceData) {
                    $client->customPrices()->create($priceData);
                }
            }

            return $client;
        });
    }
}
