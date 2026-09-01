<?php

use App\Models\Client;

test('a client only sees their own meetings and follow-ups in the portal', function () {
    $clientA = Client::create([
        'name' => 'Client A', 'phone' => '01700000000', 'type' => 'Consumer',
        'username' => 'client-a', 'password' => 'secret123',
    ]);
    $clientB = Client::create([
        'name' => 'Client B', 'phone' => '01700000001', 'type' => 'Consumer',
        'username' => 'client-b', 'password' => 'secret123',
    ]);

    $activityA = $clientA->activities()->create([
        'type' => 'meeting',
        'scheduled_at' => now(),
        'note' => 'Discussed renewal',
    ]);
    $clientB->activities()->create([
        'type' => 'follow_up',
        'scheduled_at' => now(),
    ]);

    $response = $this->actingAs($clientA, 'client')->get(route('portal.activities.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('portal/activities/index')
        ->has('activities.data', 1)
        ->where('activities.data.0.id', $activityA->id)
    );
});

test('an unauthenticated request to the portal activities route redirects to the portal login', function () {
    $response = $this->get(route('portal.activities.index'));

    $response->assertRedirect(route('portal.login'));
});
