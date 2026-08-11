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

            if ($data['type'] === ClientType::Corporate->value && !empty($data['custom_prices'])) {
                foreach ($data['custom_prices'] as $priceData) {
                    $client->customPrices()->create($priceData);
                }
            }

            return $client;
        });
    }
}
