<?php

use App\Models\Client;
use App\Models\User;

test('a staff user with no role is rejected by permission middleware', function () {
    // Deliberately a bare factory user — no role, no permissions. This is the "Authorization
    // test" counterpart to the admin()-state tests: it proves permission:* middleware still
    // rejects an under-privileged user, so the P0 test-infrastructure fix (which gives most
    // tests an Admin user) didn't accidentally weaken or bypass authorization.
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('reports'));

    $response->assertForbidden();
});

test('a guest is redirected to login instead of being rejected outright', function () {
    $response = $this->get(route('reports'));

    $response->assertRedirect(route('login'));
});

test('an authenticated portal client cannot reach a staff-only route', function () {
    $client = Client::create([
        'name' => 'Acme Corp',
        'phone' => '01700000000',
        'type' => 'Consumer',
        'username' => 'acme',
        'password' => 'secret123',
    ]);

    // Deliberately auth('client')->login() rather than actingAs($client, 'client'): actingAs()
    // also calls Auth::shouldUse('client'), which repoints the guard-less default resolution for
    // the rest of *this* request — a side effect that only happens in reality when a request is
    // actually routed through client-guard middleware (Portal routes), which a staff route never
    // is. Logging into the 'client' guard directly, without touching what "default" means,
    // matches what a real browser session looks like when it hits an unrelated staff URL.
    auth('client')->login($client);

    $response = $this->get(route('reports'));

    // Staff routes sit behind the 'web' guard's `auth` middleware, not the 'client' guard, so a
    // request authenticated only on 'client' is treated as a guest here and redirected to the
    // staff login — it never reaches the permission check or the controller.
    $response->assertRedirect(route('login'));
});
