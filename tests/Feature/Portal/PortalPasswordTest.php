<?php

use App\Models\Client;
use Illuminate\Support\Facades\Hash;

test('a client can change their own portal password', function () {
    $client = Client::create([
        'name' => 'Acme Corp', 'phone' => '01700000000', 'type' => 'Consumer',
        'username' => 'acme', 'password' => 'old-password',
    ]);

    $response = $this->actingAs($client, 'client')->put(route('portal.password.update'), [
        'current_password' => 'old-password',
        'password' => 'new-password123',
        'password_confirmation' => 'new-password123',
    ]);

    $response->assertSessionHasNoErrors();
    expect(Hash::check('new-password123', $client->fresh()->password))->toBeTrue();
});

test('changing the portal password requires the correct current password', function () {
    $client = Client::create([
        'name' => 'Acme Corp', 'phone' => '01700000000', 'type' => 'Consumer',
        'username' => 'acme', 'password' => 'old-password',
    ]);

    $response = $this->actingAs($client, 'client')->put(route('portal.password.update'), [
        'current_password' => 'wrong-password',
        'password' => 'new-password123',
        'password_confirmation' => 'new-password123',
    ]);

    $response->assertSessionHasErrors('current_password');
    expect(Hash::check('old-password', $client->fresh()->password))->toBeTrue();
});
