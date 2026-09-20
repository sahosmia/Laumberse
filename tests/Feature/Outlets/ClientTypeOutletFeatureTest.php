<?php

use App\Enums\ClientType;
use App\Models\Client;
use App\Models\Outlet;
use App\Models\User;

/**
 * Client type availability (Consumer/Corporate/B2B) is one more thing an outlet can turn on/off —
 * see App\Support\OutletFeatures::CLIENT_TYPES. Gated against the *creator's own active outlet*
 * (OutletContext::current()), not the client's own outlet_id, since a Corporate client is never
 * assigned one at all.
 */
test('creating a client of a type disabled for the current outlet is rejected', function () {
    $outlet = Outlet::factory()->withDisabledFeatures(['B2B'])->create();
    $user = User::factory()->for($outlet, 'outlet')->create();
    $user->assignRole('Sales Staff');

    $response = test()->actingAs($user)->post(route('clients.store'), [
        'name' => 'New B2B Co',
        'phone' => '01700000010',
        'type' => 'B2B',
        'outlet_id' => $outlet->id,
    ]);

    $response->assertSessionHasErrors(['type']);
    expect(Client::where('phone', '01700000010')->exists())->toBeFalse();
});

test('creating a Corporate client is rejected when the current outlet has Corporate disabled, even though Corporate has no outlet_id of its own', function () {
    $outlet = Outlet::factory()->withDisabledFeatures(['Corporate'])->create();
    $user = User::factory()->for($outlet, 'outlet')->create();
    $user->assignRole('Sales Staff');

    $response = test()->actingAs($user)->post(route('clients.store'), [
        'name' => 'New Corp Client',
        'phone' => '01700000011',
        'type' => 'Corporate',
    ]);

    $response->assertSessionHasErrors(['type']);
});

test('creating a client of a type still enabled for the current outlet succeeds', function () {
    $outlet = Outlet::factory()->withDisabledFeatures(['B2B'])->create();
    $user = User::factory()->for($outlet, 'outlet')->create();
    $user->assignRole('Sales Staff');

    test()->actingAs($user)->post(route('clients.store'), [
        'name' => 'New Consumer',
        'phone' => '01700000012',
        'type' => 'Consumer',
        'outlet_id' => $outlet->id,
    ])->assertSessionHasNoErrors();

    expect(Client::where('phone', '01700000012')->value('type'))->toBe(ClientType::Consumer);
});

test('an admin viewing All Outlets is not restricted to any single outlet\'s client types', function () {
    Outlet::factory()->withDisabledFeatures(['B2B', 'Corporate'])->create();
    $admin = User::factory()->admin()->create();
    test()->actingAs($admin)->post(route('outlet-context.update'), ['outlet' => 'all'])->assertRedirect();

    test()->actingAs($admin)->post(route('clients.store'), [
        'name' => 'Global B2B',
        'phone' => '01700000013',
        'type' => 'B2B',
        'outlet_id' => Outlet::first()->id,
    ])->assertSessionHasNoErrors();
});

test('editing an existing client keeps its type even if the outlet has since disabled that type', function () {
    $outlet = Outlet::factory()->create();
    $user = User::factory()->for($outlet, 'outlet')->create();
    $user->assignRole('Sales Staff');
    $user->givePermissionTo('clients.edit');

    $client = Client::create(['name' => 'Old B2B Client', 'phone' => '01700000014', 'type' => 'B2B', 'outlet_id' => $outlet->id]);
    $outlet->update(['disabled_features' => ['B2B']]);

    test()->actingAs($user)->put(route('clients.update', $client), [
        'name' => 'Old B2B Client (renamed)',
        'phone' => '01700000014',
        'type' => 'B2B',
        'outlet_id' => $outlet->id,
    ])->assertSessionHasNoErrors();

    expect($client->fresh()->name)->toBe('Old B2B Client (renamed)');
});
