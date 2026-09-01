<?php

use App\Models\User;
use App\Models\Client;
use App\Models\Invoice;
use App\Models\Unit;
use Inertia\Testing\AssertableInertia as Assert;

test('invoice list paginates 50 per page and reports total count', function () {
    $user = User::factory()->admin()->create();
    $client = Client::create(['name' => 'John Doe', 'phone' => '123456789']);

    for ($i = 0; $i < 60; $i++) {
        Invoice::create([
            'invoice_uuid' => 'INV-' . str_pad((string) ($i + 1), 4, '0', STR_PAD_LEFT),
            'date' => now()->toDateString(),
            'client_id' => $client->id,
            'total' => 100,
            'paid' => 100,
            'due' => 0,
            'status' => 'Processing',
            'method' => 'Cash',
        ]);
    }

    $response = $this->actingAs($user)->get(route('history'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->has('invoices.data', 50)
        ->where('invoices.total', 60)
        ->where('invoices.last_page', 2)
    );
});

test('invoice list search filters server-side across pages', function () {
    $user = User::factory()->admin()->create();
    $alice = Client::create(['name' => 'Alice Wonderland', 'phone' => '111']);
    $bob = Client::create(['name' => 'Bob Builder', 'phone' => '222']);

    Invoice::create([
        'invoice_uuid' => 'INV-0001',
        'date' => now()->toDateString(),
        'client_id' => $alice->id,
        'total' => 100,
        'paid' => 100,
        'due' => 0,
        'status' => 'Processing',
        'method' => 'Cash',
    ]);
    Invoice::create([
        'invoice_uuid' => 'INV-0002',
        'date' => now()->toDateString(),
        'client_id' => $bob->id,
        'total' => 100,
        'paid' => 100,
        'due' => 0,
        'status' => 'Processing',
        'method' => 'Cash',
    ]);

    $response = $this->actingAs($user)->get(route('history', ['search' => 'Alice']));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->has('invoices.data', 1)
        ->where('invoices.data.0.client.name', 'Alice Wonderland')
    );
});

test('units list paginates and second page is reachable', function () {
    $user = User::factory()->admin()->create();

    for ($i = 0; $i < 55; $i++) {
        Unit::create(['name' => "Unit {$i}", 'short_name' => "u{$i}"]);
    }

    $response = $this->actingAs($user)->get(route('units.index', ['page' => 2]));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->has('units.data', 5)
        ->where('units.current_page', 2)
    );
});
