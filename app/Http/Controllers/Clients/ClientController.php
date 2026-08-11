<?php

namespace App\Http\Controllers\Clients;

use App\Actions\Clients\CreateClientAction;
use App\Actions\Clients\UpdateClientAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Clients\StoreClientRequest;
use App\Http\Requests\Clients\UpdateClientRequest;
use App\Models\Client;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClientController extends Controller
{
    public function index(Request $request)
    {
        $clients = Client::with('customPrices')
            ->when($request->search, fn($q, $s) => $q->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")->orWhere('phone', 'like', "%{$s}%");
            }))
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('clients/index', [
            'clients' => $clients,
            'products' => Product::all(),
            'filters' => ['search' => $request->search],
        ]);
    }

    public function store(StoreClientRequest $request, CreateClientAction $action)
    {
        $action($request->validated());

        return redirect()->back()->with('success', 'Client created successfully.');
    }

    public function show(Client $client)
    {
        return Inertia::render('clients/show', [
            'client' => $client->load(['invoices.items.product', 'customPrices.product']),
        ]);
    }

    public function update(UpdateClientRequest $request, Client $client, UpdateClientAction $action)
    {
        $action($client, $request->validated());

        return redirect()->back()->with('success', 'Client updated successfully.');
    }

    public function destroy(Client $client)
    {
        $client->delete();
        return redirect()->back()->with('success', 'Client deleted successfully.');
    }
}
