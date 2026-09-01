<?php

use App\Models\Client;

function createPortalClient(array $overrides = []): Client
{
    return Client::create(array_merge([
        'name' => 'Acme Corp',
        'phone' => '01700000000',
        'type' => 'Consumer',
        'username' => 'acme',
        'password' => 'secret123',
    ], $overrides));
}

test('a client with portal credentials can log in', function () {
    createPortalClient();

    $response = $this->post(route('portal.login'), [
        'username' => 'acme',
        'password' => 'secret123',
    ]);

    $response->assertRedirect(route('portal.invoices.index'));
    $this->assertAuthenticated('client');
});

test('a client cannot log in with the wrong password', function () {
    createPortalClient();

    $response = $this->post(route('portal.login'), [
        'username' => 'acme',
        'password' => 'wrong-password',
    ]);

    $response->assertSessionHasErrors('username');
    $this->assertGuest('client');
});

test('a client without portal credentials cannot log in', function () {
    createPortalClient(['username' => 'nouser', 'password' => 'secret123']);

    $response = $this->post(route('portal.login'), [
        'username' => 'someone-else',
        'password' => 'secret123',
    ]);

    $response->assertSessionHasErrors('username');
    $this->assertGuest('client');
});

test('logging into the client portal does not authenticate the staff guard', function () {
    createPortalClient();

    $this->post(route('portal.login'), [
        'username' => 'acme',
        'password' => 'secret123',
    ]);

    $this->assertAuthenticated('client');
    $this->assertGuest('web');
});

test('an unauthenticated request to a protected portal route redirects to the portal login', function () {
    $response = $this->get(route('portal.invoices.index'));

    $response->assertRedirect(route('portal.login'));
});

test('a logged-in client can log out of the portal', function () {
    $client = createPortalClient();

    $this->actingAs($client, 'client');
    $this->assertAuthenticated('client');

    $response = $this->post(route('portal.logout'));

    $response->assertRedirect(route('portal.login'));
    $this->assertGuest('client');
});
