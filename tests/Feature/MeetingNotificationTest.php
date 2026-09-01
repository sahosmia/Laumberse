<?php

use App\Enums\MeetingNotificationType;
use App\Models\Client;
use App\Models\ClientActivity;
use App\Models\User;
use App\Notifications\MeetingActivityNotification;
use App\Support\Permissions;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Notification;
use Spatie\Permission\Models\Role;

function createNotifyClient(array $overrides = []): Client
{
    return Client::create(array_merge([
        'name' => 'Acme Corp',
        'phone' => '01700000000',
        'type' => 'Consumer',
    ], $overrides));
}

/** A plain staff user with the "receive all meeting notifications" permission (no other role/permission). */
function userWithMeetingNotifyPermission(string $name = 'Notify User'): User
{
    $role = Role::firstOrCreate(['name' => 'Meeting Notify Test Role '.uniqid(), 'guard_name' => 'web']);
    $role->givePermissionTo(Permissions::MEETING_NOTIFY_ALL);

    $user = User::factory()->create(['name' => $name]);
    $user->assignRole($role);

    return $user;
}

test('the meeting creator receives a notification when a meeting is created', function () {
    Notification::fake();
    $creator = actingAsAdmin();
    $client = createNotifyClient();

    $this->post(route('clients.activities.store', $client), [
        'type' => 'meeting',
        'scheduled_at' => now()->addDay()->format('Y-m-d H:i:s'),
    ])->assertSessionHasNoErrors();

    $activity = ClientActivity::firstOrFail();

    Notification::assertSentTo($creator, MeetingActivityNotification::class, function ($notification) use ($activity) {
        return $notification->activity->id === $activity->id
            && $notification->notificationType === MeetingNotificationType::Created;
    });
});

test('a user with the all-meetings-notification permission receives the notification even though they did not create it', function () {
    Notification::fake();
    actingAsAdmin();
    $notifyUser = userWithMeetingNotifyPermission();
    $client = createNotifyClient();

    $this->post(route('clients.activities.store', $client), [
        'type' => 'meeting',
        'scheduled_at' => now()->addDay()->format('Y-m-d H:i:s'),
    ])->assertSessionHasNoErrors();

    Notification::assertSentTo($notifyUser, MeetingActivityNotification::class);
});

test('a user without the permission and who did not create the meeting receives nothing', function () {
    Notification::fake();
    actingAsAdmin();
    $bystander = User::factory()->create(['name' => 'Bystander']);
    $client = createNotifyClient();

    $this->post(route('clients.activities.store', $client), [
        'type' => 'meeting',
        'scheduled_at' => now()->addDay()->format('Y-m-d H:i:s'),
    ])->assertSessionHasNoErrors();

    Notification::assertNotSentTo($bystander, MeetingActivityNotification::class);
});

test('a creator who also holds the all-meetings-notification permission receives exactly one notification, not two', function () {
    Notification::fake();

    $role = Role::firstOrCreate(['name' => 'Creator Notify Role '.uniqid(), 'guard_name' => 'web']);
    $role->givePermissionTo(Permissions::MEETING_NOTIFY_ALL);
    $creator = User::factory()->admin()->create();
    $creator->assignRole($role);
    $this->actingAs($creator);

    $client = createNotifyClient();

    $this->post(route('clients.activities.store', $client), [
        'type' => 'meeting',
        'scheduled_at' => now()->addDay()->format('Y-m-d H:i:s'),
    ])->assertSessionHasNoErrors();

    Notification::assertSentToTimes($creator, MeetingActivityNotification::class, 1);
});

test('multiple all-meetings-notification users each receive exactly one notification', function () {
    Notification::fake();
    actingAsAdmin();
    $userB = userWithMeetingNotifyPermission('B');
    $userC = userWithMeetingNotifyPermission('C');
    $userD = userWithMeetingNotifyPermission('D');
    $client = createNotifyClient();

    $this->post(route('clients.activities.store', $client), [
        'type' => 'meeting',
        'scheduled_at' => now()->addDay()->format('Y-m-d H:i:s'),
    ])->assertSessionHasNoErrors();

    foreach ([$userB, $userC, $userD] as $user) {
        Notification::assertSentToTimes($user, MeetingActivityNotification::class, 1);
    }
});

test('the meeting-day command sends a notification only at or after 8am on the meeting date, and only once', function () {
    Notification::fake();
    $creator = actingAsAdmin();
    $client = createNotifyClient();
    $activity = $client->activities()->create([
        'type' => 'meeting',
        'scheduled_at' => today()->setTime(15, 0),
        'created_by' => $creator->id,
    ]);

    $this->travelTo(today()->setTime(7, 59));
    Artisan::call('meetings:send-due-notifications');
    Notification::assertNothingSent();
    expect($activity->fresh()->meeting_day_notified_at)->toBeNull();

    $this->travelTo(today()->setTime(8, 1));
    Artisan::call('meetings:send-due-notifications');
    Notification::assertSentTo($creator, MeetingActivityNotification::class, fn ($n) => $n->notificationType === MeetingNotificationType::Today);
    expect($activity->fresh()->meeting_day_notified_at)->not->toBeNull();

    // Running again the same day must not resend.
    Notification::fake();
    Artisan::call('meetings:send-due-notifications');
    Notification::assertNothingSent();
});

test('a reminder notification fires once the reminder window is reached, and includes correct recipients', function () {
    Notification::fake();
    // Frozen before 8am so only the reminder due-check is exercised.
    $this->travelTo(today()->setTime(6, 0));
    $creator = actingAsAdmin();
    $client = createNotifyClient();
    $activity = $client->activities()->create([
        'type' => 'meeting',
        'scheduled_at' => now()->addMinutes(20),
        'reminder_minutes' => 30,
        'created_by' => $creator->id,
    ]);

    Artisan::call('meetings:send-due-notifications');

    Notification::assertSentTo($creator, MeetingActivityNotification::class, fn ($n) => $n->notificationType === MeetingNotificationType::Reminder);
    expect($activity->fresh()->reminder_notified_at)->not->toBeNull();
});

test('changing the reminder does not leave a duplicate schedule', function () {
    $creator = actingAsAdmin();
    $client = createNotifyClient();
    $scheduledAt = now()->addHour();
    $activity = $client->activities()->create([
        'type' => 'meeting',
        'scheduled_at' => $scheduledAt,
        'reminder_minutes' => 30,
        'created_by' => $creator->id,
    ]);
    $activity->forceFill(['reminder_notified_at' => now()])->save();

    $this->put(route('clients.activities.update', [$client, $activity]), [
        'type' => 'meeting',
        'scheduled_at' => $scheduledAt->format('Y-m-d H:i:s'),
        'reminder_minutes' => 15,
    ])->assertSessionHasNoErrors();

    // The dedupe flag must be cleared so the new reminder window can still fire — it must not
    // silently stay "already notified" forever, and no second flag/row was created for it.
    expect($activity->fresh()->reminder_notified_at)->toBeNull();
    expect($activity->fresh()->reminder_minutes)->toBe(15);
});

test('removing the reminder prevents any reminder notification', function () {
    Notification::fake();
    // Frozen well before 8am so this test only exercises the reminder due-check, not the
    // unrelated meeting-day check (which would otherwise also fire for a meeting scheduled
    // later today, depending on what real wall-clock time the suite happens to run at).
    $this->travelTo(today()->setTime(6, 0));
    $creator = actingAsAdmin();
    $client = createNotifyClient();
    $scheduledAt = now()->addMinutes(10);
    $activity = $client->activities()->create([
        'type' => 'meeting',
        'scheduled_at' => $scheduledAt,
        'reminder_minutes' => 30,
        'created_by' => $creator->id,
    ]);

    $this->put(route('clients.activities.update', [$client, $activity]), [
        'type' => 'meeting',
        'scheduled_at' => $scheduledAt->format('Y-m-d H:i:s'),
        'reminder_minutes' => '',
    ])->assertSessionHasNoErrors();

    expect($activity->fresh()->reminder_minutes)->toBeNull();

    Notification::fake(); // ignore the "Updated" notification from the edit above
    Artisan::call('meetings:send-due-notifications');

    Notification::assertNothingSent();
});

test('cancelling a meeting prevents its scheduled meeting-day and reminder notifications', function () {
    Notification::fake();
    $creator = actingAsAdmin();
    $client = createNotifyClient();
    $activity = $client->activities()->create([
        'type' => 'meeting',
        'scheduled_at' => today()->setTime(9, 0),
        'reminder_minutes' => 30,
        'status' => 'cancelled',
        'created_by' => $creator->id,
    ]);

    $this->travelTo(today()->setTime(10, 0));
    Artisan::call('meetings:send-due-notifications');

    Notification::assertNothingSent();
    expect($activity->fresh()->meeting_day_notified_at)->toBeNull();
});

test('changing the meeting date prevents the old date from ever notifying', function () {
    Notification::fake();
    $creator = actingAsAdmin();
    $client = createNotifyClient();
    $activity = $client->activities()->create([
        'type' => 'meeting',
        'scheduled_at' => today()->setTime(9, 0),
        'created_by' => $creator->id,
    ]);
    $activity->forceFill(['meeting_day_notified_at' => now()])->save();

    // Reschedule to tomorrow.
    $this->put(route('clients.activities.update', [$client, $activity]), [
        'type' => 'meeting',
        'scheduled_at' => today()->addDay()->setTime(9, 0)->format('Y-m-d H:i:s'),
    ])->assertSessionHasNoErrors();

    expect($activity->fresh()->meeting_day_notified_at)->toBeNull();

    // Today's due-check must not fire for it (it's no longer today's meeting).
    Notification::fake();
    $this->travelTo(today()->setTime(10, 0));
    Artisan::call('meetings:send-due-notifications');
    Notification::assertNothingSent();
});

test('the notification payload contains the correct meeting information', function () {
    Notification::fake();
    $creator = actingAsAdmin();
    $client = createNotifyClient(['name' => 'Beximco Pharma']);
    $scheduledAt = now()->addDay()->setTime(15, 0);

    $this->post(route('clients.activities.store', $client), [
        'type' => 'meeting',
        'scheduled_at' => $scheduledAt->format('Y-m-d H:i:s'),
    ])->assertSessionHasNoErrors();

    $activity = ClientActivity::firstOrFail();

    Notification::assertSentTo($creator, MeetingActivityNotification::class, function ($notification) use ($activity, $client) {
        $data = $notification->toArray($notification);

        return $data['activity_id'] === $activity->id
            && $data['client_id'] === $client->id
            && $data['client_name'] === 'Beximco Pharma'
            && $data['notification_type'] === MeetingNotificationType::Created->value
            && str_contains($data['message'], 'Beximco Pharma');
    });
});

test('no notification is dispatched when the activity fails validation and is never persisted', function () {
    Notification::fake();
    actingAsAdmin();
    $client = createNotifyClient();

    $this->post(route('clients.activities.store', $client), [
        'type' => 'invalid-type',
        'scheduled_at' => now()->format('Y-m-d H:i:s'),
    ])->assertSessionHasErrors('type');

    expect(ClientActivity::count())->toBe(0);
    Notification::assertNothingSent();
});

test('the frontend cannot manipulate notification recipients via the request body', function () {
    Notification::fake();
    $creator = actingAsAdmin();
    $bystander = User::factory()->create(['name' => 'Outsider']);
    $client = createNotifyClient();

    // An attacker-supplied recipient list is not a validated field, so it's silently dropped —
    // recipients are always resolved server-side from creator + permission holders only.
    $this->post(route('clients.activities.store', $client), [
        'type' => 'meeting',
        'scheduled_at' => now()->addDay()->format('Y-m-d H:i:s'),
        'recipient_user_ids' => [$bystander->id],
    ])->assertSessionHasNoErrors();

    Notification::assertSentTo($creator, MeetingActivityNotification::class);
    Notification::assertNotSentTo($bystander, MeetingActivityNotification::class);
});
