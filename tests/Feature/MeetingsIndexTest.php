<?php

use App\Models\Client;

function createMeetingsIndexClient(array $overrides = []): Client
{
    return Client::create(array_merge([
        'name' => 'Acme Corp',
        'phone' => '01700000000',
        'type' => 'Consumer',
    ], $overrides));
}

test('the meetings index page lists activities across every client', function () {
    $admin = actingAsAdmin();
    $clientA = createMeetingsIndexClient(['name' => 'Client A']);
    $clientB = createMeetingsIndexClient(['name' => 'Client B']);
    $clientA->activities()->create(['type' => 'meeting', 'scheduled_at' => now(), 'created_by' => $admin->id]);
    $clientB->activities()->create(['type' => 'follow_up', 'scheduled_at' => now(), 'created_by' => $admin->id]);

    $response = $this->get(route('meetings.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('meetings/index')
        ->has('activities.data', 2)
        ->has('clients', 2)
    );
});

test('the meetings index page can be filtered by type and searched by client name', function () {
    $admin = actingAsAdmin();
    $clientA = createMeetingsIndexClient(['name' => 'Beximco Pharma']);
    $clientB = createMeetingsIndexClient(['name' => 'Square Group']);
    $clientA->activities()->create(['type' => 'meeting', 'scheduled_at' => now(), 'created_by' => $admin->id]);
    $clientB->activities()->create(['type' => 'follow_up', 'scheduled_at' => now(), 'created_by' => $admin->id]);

    $response = $this->get(route('meetings.index', ['type' => 'meeting']));
    $response->assertInertia(fn ($page) => $page->has('activities.data', 1));

    $response = $this->get(route('meetings.index', ['search' => 'Beximco']));
    $response->assertInertia(fn ($page) => $page->has('activities.data', 1));
});

test('a user without clients.view permission cannot reach the meetings index page', function () {
    $user = \App\Models\User::factory()->create();

    $this->actingAs($user)->get(route('meetings.index'))->assertForbidden();
});
