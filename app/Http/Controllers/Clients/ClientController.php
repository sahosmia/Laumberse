<?php

namespace App\Http\Controllers\Clients;

use App\Http\Controllers\Controller;
use App\Http\Requests\Clients\StoreClientRequest;
use App\Http\Requests\Clients\UpdateClientRequest;
use App\Models\Client;
use App\Models\CustomerProductPrice;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ClientController extends Controller
{
    public function index()
    {


        return Inertia::render('clients/index', [
            'clients' => Client::with('customPrices')->orderBy('created_at', 'desc')->get(),
            'products' => Product::all(),
        ]);
    }

    public function store(StoreClientRequest $request)
    {
        DB::transaction(function () use ($request) {
            $validated = $request->validated();
            $client = Client::create($validated);

            if ($validated['type'] === 'Corporate' && !empty($validated['custom_prices'])) {
                foreach ($validated['custom_prices'] as $priceData) {
                    $client->customPrices()->create($priceData);
                }
            }
        });

        return redirect()->back()->with('success', 'Client created successfully.');
    }

    public function update(UpdateClientRequest $request, Client $client)
    {
        DB::transaction(function () use ($request, $client) {
            $validated = $request->validated();
            $client->update($validated);

            if ($validated['type'] === 'Corporate') {
                $client->customPrices()->delete();
                if (!empty($validated['custom_prices'])) {
                    foreach ($validated['custom_prices'] as $priceData) {
                        $client->customPrices()->create($priceData);
                    }
                }
            } else {
                $client->customPrices()->delete();
            }
        });

        return redirect()->back()->with('success', 'Client updated successfully.');
    }

    public function show(Client $client)
    {
        return Inertia::render('clients/show', [
            'client' => $client->load(['invoices.items.product', 'customPrices.product']),
        ]);
    }

    public function destroy(Client $client)
    {
        $client->delete();
        return redirect()->back()->with('success', 'Client deleted successfully.');
    }
}
