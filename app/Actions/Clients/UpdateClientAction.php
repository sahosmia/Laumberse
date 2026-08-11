<?php

namespace App\Actions\Clients;

use App\Enums\ClientType;
use App\Models\Client;
use Illuminate\Support\Facades\DB;

class UpdateClientAction
{
    public function __invoke(Client $client, array $data): Client
    {
        return DB::transaction(function () use ($client, $data) {
            $client->update($data);

            if ($data['type'] === ClientType::Corporate->value) {
                $client->customPrices()->delete();
                if (!empty($data['custom_prices'])) {
                    foreach ($data['custom_prices'] as $priceData) {
                        $client->customPrices()->create($priceData);
                    }
                }
            } else {
                $client->customPrices()->delete();
            }

            return $client;
        });
    }
}
