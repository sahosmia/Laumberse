<?php

use App\Models\Client;
use App\Models\ClientActivity;
use App\Models\Outlet;
use App\Models\User;

/**
 * Same security matrix pattern as InvoiceOutletIsolationTest — see that file's header comment.
 * Client itself stays GLOBAL (visible from every outlet); only the activity record is scoped.
 */
function makeActivityFor(User $user, ?Client $client = null, array $overrides = []): ClientActivity
{
    $client ??= Client::create(['name' => 'Client-'.uniqid(), 'phone' => '017'.random_int(10000000, 99999999)]);

    $data = array_merge([
        'type' => 'meeting',
        'scheduled_at' => now()->addMinute()->format('Y-m-d H:i:s'),
        'note' => 'Test activity',
    ], $overrides);

    test()->actingAs($user)->post(route('clients.activities.store', $client), $data)->assertSessionHasNoErrors();

    return ClientActivity::latest('id')->first();
}

test('the global meetings list only shows activities from the current outlet scope', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Sales Staff');
    $userB = User::factory()->for($outletB, 'outlet')->create();
    $userB->assignRole('Sales Staff');

    $activityA = makeActivityFor($userA);
    $activityB = makeActivityFor($userB);

    $response = test()->actingAs($userA)->get(route('meetings.index'));

    $ids = collect($response->viewData('page')['props']['activities']['data'])->pluck('id');
    expect($ids)->toContain($activityA->id);
    expect($ids)->not->toContain($activityB->id);
});

test('a user cannot update another outlet\'s activity even for the same global client', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Sales Staff');
    $userB = User::factory()->for($outletB, 'outlet')->create();
    $userB->assignRole('Sales Staff');

    $client = Client::create(['name' => 'Shared Client', 'phone' => '01700000099']);
    $activityB = makeActivityFor($userB, $client);
    $originalNote = $activityB->note;

    test()->actingAs($userA)->put(route('clients.activities.update', [$client, $activityB]), [
        'type' => 'meeting',
        'scheduled_at' => $activityB->scheduled_at,
        'note' => 'Hacked note',
    ])->assertNotFound();

    expect($activityB->fresh()->note)->toBe($originalNote);
});

test('a user cannot delete another outlet\'s activity even for the same global client', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    // Sales Staff doesn't hold clients.delete by default (see Permissions::defaultsByRole) —
    // granted explicitly here since this test is about outlet isolation, not role permissions.
    $userA->assignRole('Sales Staff');
    $userA->givePermissionTo('clients.delete');
    $userB = User::factory()->for($outletB, 'outlet')->create();
    $userB->assignRole('Sales Staff');

    $client = Client::create(['name' => 'Shared Client', 'phone' => '01700000098']);
    $activityB = makeActivityFor($userB, $client);

    test()->actingAs($userA)->delete(route('clients.activities.destroy', [$client, $activityB]))->assertNotFound();

    expect(ClientActivity::find($activityB->id))->not->toBeNull();
});

test('a client\'s own detail page only lists activities and invoices from the current outlet scope', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Sales Staff');
    $userA->givePermissionTo('clients.view');
    $userB = User::factory()->for($outletB, 'outlet')->create();
    $userB->assignRole('Sales Staff');

    $client = Client::create(['name' => 'Shared Client', 'phone' => '01700000097']);
    $activityA = makeActivityFor($userA, $client);
    $activityB = makeActivityFor($userB, $client);

    $response = test()->actingAs($userA)->get(route('clients.show', $client));

    $ids = collect($response->viewData('page')['props']['activities']['data'])->pluck('id');
    expect($ids)->toContain($activityA->id);
    expect($ids)->not->toContain($activityB->id);
});

test('an activity is always assigned to the creator\'s own outlet, even if a different outlet_id is forged in the payload', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Sales Staff');

    $activity = makeActivityFor($userA, null, ['outlet_id' => $outletB->id]);

    expect($activity->outlet_id)->toBe($userA->outlet_id)
        ->and($activity->outlet_id)->not->toBe($outletB->id);
});

test('an admin who switches to All Outlets sees activities from every outlet in the global meetings list', function () {
    $outletB = Outlet::factory()->create();
    $admin = User::factory()->admin()->create();
    $userB = User::factory()->for($outletB, 'outlet')->create();
    $userB->assignRole('Sales Staff');

    $activityAdmin = makeActivityFor($admin);
    $activityB = makeActivityFor($userB);

    test()->actingAs($admin)->post(route('outlet-context.update'), ['outlet' => 'all'])
        ->assertRedirect()->assertSessionHasNoErrors();

    $response = test()->actingAs($admin)->get(route('meetings.index'));

    $ids = collect($response->viewData('page')['props']['activities']['data'])->pluck('id');
    expect($ids)->toContain($activityAdmin->id);
    expect($ids)->toContain($activityB->id);
});

test('the global meetings list only offers staff from the current outlet scope for assignment', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Manager');
    $userB = User::factory()->for($outletB, 'outlet')->create();
    $userB->assignRole('Manager');

    $employeeA = makeEmployeeFor($userA);
    $employeeB = makeEmployeeFor($userB);

    $response = test()->actingAs($userA)->get(route('meetings.index'));

    $ids = collect($response->viewData('page')['props']['employees'])->pluck('id');
    expect($ids)->toContain($employeeA->id);
    expect($ids)->not->toContain($employeeB->id);
});

test('logging an activity while viewing All Outlets requires a valid outlet_id', function () {
    $admin = User::factory()->admin()->create();
    test()->actingAs($admin)->post(route('outlet-context.update'), ['outlet' => 'all'])
        ->assertRedirect()->assertSessionHasNoErrors();

    $client = Client::create(['name' => 'New Client', 'phone' => '01700000096']);

    $response = test()->actingAs($admin)->post(route('clients.activities.store', $client), [
        'type' => 'meeting',
        'scheduled_at' => now()->addMinute()->format('Y-m-d H:i:s'),
    ]);

    $response->assertSessionHasErrors(['outlet_id']);
});
