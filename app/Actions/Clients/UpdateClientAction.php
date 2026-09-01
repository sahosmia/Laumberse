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
            // Blank means "keep the current password" — never overwrite it with null.
            if (empty($data['password'])) {
                unset($data['password']);
            }

            // Empty string would violate the unique index on username; only NULL is exempt.
            // (A blank username here is a deliberate revoke-portal-access action.)
            if (array_key_exists('username', $data)) {
                $data['username'] = $data['username'] ?: null;
            }

            $client->update($data);

            if ($data['type'] === ClientType::Corporate->value) {
                $client->customPrices()->delete();
                if (! empty($data['custom_prices'])) {
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
