<?php

use App\Models\Client;
use App\Models\ClientActivity;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Support\Carbon;

function createClient(array $overrides = []): Client
{
    return Client::create(array_merge([
        'name' => 'Acme Corp',
        'phone' => '01700000000',
        'type' => 'Consumer',
    ], $overrides));
}

test('a meeting can be logged for a client', function () {
    $user = User::factory()->admin()->create();
    $client = createClient();
    $employee = Employee::create(['name' => 'Sales Rep', 'phone' => '01711111111', 'designation' => 'Sales', 'base_salary' => 10000]);

    $response = $this->actingAs($user)->post(route('clients.activities.store', $client), [
        'type' => 'meeting',
        'scheduled_at' => now()->addMinute()->format('Y-m-d H:i:s'),
        'note' => 'Discussed new order',
        'employee_id' => $employee->id,
    ]);

    $response->assertSessionHasNoErrors();
    $this->assertDatabaseHas('client_activities', [
        'client_id' => $client->id,
        'employee_id' => $employee->id,
        'type' => 'meeting',
        'note' => 'Discussed new order',
        'status' => 'pending',
    ]);
});

test('a follow-up can be logged with a next follow-up date', function () {
    $user = User::factory()->admin()->create();
    $client = createClient();

    $response = $this->actingAs($user)->post(route('clients.activities.store', $client), [
        'type' => 'follow_up',
        'scheduled_at' => now()->addMinute()->format('Y-m-d H:i:s'),
        'note' => 'Call back next week',
        'next_follow_up_date' => now()->addWeek()->format('Y-m-d'),
    ]);

    $response->assertSessionHasNoErrors();
    $this->assertDatabaseHas('client_activities', [
        'client_id' => $client->id,
        'type' => 'follow_up',
        'next_follow_up_date' => now()->addWeek()->format('Y-m-d'),
    ]);
});

test('logging an activity with a next follow-up date auto-creates a pending follow-up', function () {
    $user = User::factory()->admin()->create();
    $client = createClient();
    $employee = Employee::create(['name' => 'Sales Rep', 'phone' => '01711111111', 'designation' => 'Sales', 'base_salary' => 10000]);
    $nextDate = now()->addWeek()->format('Y-m-d');

    $response = $this->actingAs($user)->post(route('clients.activities.store', $client), [
        'type' => 'meeting',
        'scheduled_at' => now()->addMinute()->format('Y-m-d H:i:s'),
        'note' => 'Discussed renewal',
        'employee_id' => $employee->id,
        'next_follow_up_date' => $nextDate,
    ]);

    $response->assertSessionHasNoErrors();
    expect(ClientActivity::count())->toBe(2);

    $parent = ClientActivity::where('type', 'meeting')->firstOrFail();
    $child = ClientActivity::where('type', 'follow_up')->firstOrFail();

    expect($child->parent_activity_id)->toBe($parent->id);
    expect($child->status)->toBe('pending');
    expect($child->employee_id)->toBe($employee->id);
    expect(Carbon::parse($child->scheduled_at)->format('Y-m-d'))->toBe($nextDate);
});

test('logging an activity without a next follow-up date does not auto-create anything', function () {
    $user = User::factory()->admin()->create();
    $client = createClient();

    $this->actingAs($user)->post(route('clients.activities.store', $client), [
        'type' => 'meeting',
        'scheduled_at' => now()->addMinute()->format('Y-m-d H:i:s'),
    ])->assertSessionHasNoErrors();

    expect(ClientActivity::count())->toBe(1);
});

test('updating an activity to add a next follow-up date does not auto-create anything', function () {
    $user = User::factory()->admin()->create();
    $client = createClient();
    $activity = $client->activities()->create([
        'type' => 'follow_up',
        'scheduled_at' => now(),
    ]);

    $this->actingAs($user)->put(route('clients.activities.update', [$client, $activity]), [
        'type' => 'follow_up',
        'scheduled_at' => $activity->scheduled_at->format('Y-m-d H:i:s'),
        'next_follow_up_date' => now()->addWeek()->format('Y-m-d'),
    ])->assertSessionHasNoErrors();

    expect(ClientActivity::count())->toBe(1);
});

test('next follow-up date cannot be before the scheduled date', function () {
    $user = User::factory()->admin()->create();
    $client = createClient();

    $this->actingAs($user)->post(route('clients.activities.store', $client), [
        'type' => 'meeting',
        'scheduled_at' => now()->addMinute()->format('Y-m-d H:i:s'),
        'next_follow_up_date' => now()->subWeek()->format('Y-m-d'),
    ])->assertSessionHasErrors('next_follow_up_date');
});

test('an activity requires a valid type', function () {
    $user = User::factory()->admin()->create();
    $client = createClient();

    $this->actingAs($user)->post(route('clients.activities.store', $client), [
        'type' => 'invalid-type',
        'scheduled_at' => now()->addMinute()->format('Y-m-d H:i:s'),
    ])->assertSessionHasErrors('type');
});

test('an activity cannot be assigned to an employee that does not exist', function () {
    $user = User::factory()->admin()->create();
    $client = createClient();

    $this->actingAs($user)->post(route('clients.activities.store', $client), [
        'type' => 'meeting',
        'scheduled_at' => now()->addMinute()->format('Y-m-d H:i:s'),
        'employee_id' => 999,
    ])->assertSessionHasErrors('employee_id');
});

test('a follow-up can be marked done', function () {
    $user = User::factory()->admin()->create();
    $client = createClient();
    $activity = $client->activities()->create([
        'type' => 'follow_up',
        'scheduled_at' => now(),
        'status' => 'pending',
    ]);

    $response = $this->actingAs($user)->put(route('clients.activities.update', [$client, $activity]), [
        'type' => 'follow_up',
        'scheduled_at' => $activity->scheduled_at->format('Y-m-d H:i:s'),
        'status' => 'done',
    ]);

    $response->assertSessionHasNoErrors();
    expect($activity->fresh()->status)->toBe('done');
});

test('an activity can be deleted', function () {
    $user = User::factory()->admin()->create();
    $client = createClient();
    $activity = $client->activities()->create([
        'type' => 'meeting',
        'scheduled_at' => now(),
    ]);

    $this->actingAs($user)->delete(route('clients.activities.destroy', [$client, $activity]))
        ->assertSessionHasNoErrors();

    expect(ClientActivity::count())->toBe(0);
});

test('the client show page lists its paginated activities', function () {
    $user = User::factory()->admin()->create();
    $client = createClient();
    $client->activities()->create([
        'type' => 'meeting',
        'scheduled_at' => now(),
        'note' => 'Kickoff call',
    ]);

    $response = $this->actingAs($user)->get(route('clients.show', $client));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('clients/show')
        ->has('activities.data', 1)
    );
});
