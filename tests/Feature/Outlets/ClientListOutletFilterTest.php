<?php

use App\Models\Client;
use App\Models\Outlet;
use App\Models\User;

/**
 * Client is global (not outlet-scoped) — this covers the *filter default*, not access control.
 * See ClientController::index and OutletContext::currentId().
 */
test('the client list defaults its outlet filter to the viewer\'s own active outlet on a fresh visit', function () {
    $outletB = Outlet::factory()->create();
    $user = User::factory()->for($outletB, 'outlet')->create();
    $user->assignRole('Sales Staff');

    Client::create(['name' => 'Client A', 'phone' => '01700000001', 'outlet_id' => $user->outlet_id]);
    $clientB = Client::create(['name' => 'Client B', 'phone' => '01700000002', 'outlet_id' => $outletB->id]);

    $response = test()->actingAs($user)->get(route('clients.index'));

    $page = $response->viewData('page')['props'];
    expect($page['filters']['outlet_id'])->toBe((string) $outletB->id);
    expect(collect($page['clients']['data'])->pluck('id'))->toContain($clientB->id);
});

test('the client list stays on "All Outlets" once explicitly cleared, instead of re-defaulting', function () {
    $user = User::factory()->create();
    $user->assignRole('Sales Staff');

    $response = test()->actingAs($user)->get(route('clients.index', ['outlet_id' => 'all']));

    expect($response->viewData('page')['props']['filters']['outlet_id'])->toBe('all');
});

test('an admin viewing All Outlets gets no outlet default on the client list', function () {
    $admin = User::factory()->admin()->create();
    test()->actingAs($admin)->post(route('outlet-context.update'), ['outlet' => 'all'])->assertRedirect();

    $response = test()->actingAs($admin)->get(route('clients.index'));

    expect($response->viewData('page')['props']['filters']['outlet_id'])->toBe('all');
});

test('picking a specific outlet on the client list filters to just that outlet', function () {
    $outletA = Outlet::factory()->create();
    $outletB = Outlet::factory()->create();
    $admin = User::factory()->admin()->create();

    $clientA = Client::create(['name' => 'Client A', 'phone' => '01700000003', 'outlet_id' => $outletA->id]);
    $clientB = Client::create(['name' => 'Client B', 'phone' => '01700000004', 'outlet_id' => $outletB->id]);

    $response = test()->actingAs($admin)->get(route('clients.index', ['outlet_id' => $outletA->id]));

    $ids = collect($response->viewData('page')['props']['clients']['data'])->pluck('id');
    expect($ids)->toContain($clientA->id);
    expect($ids)->not->toContain($clientB->id);
});
