<?php

use App\Enums\MeetingNotificationType;
use App\Models\Client;
use App\Models\ClientActivity;
use App\Models\Outlet;
use App\Models\User;
use App\Notifications\MeetingActivityNotification;
use App\Support\Permissions;
use Illuminate\Support\Facades\Notification;
use Spatie\Permission\Models\Role;

/** A plain staff user with the "receive all meeting notifications" permission, in a given outlet. */
function notifyAllUserInOutlet(?Outlet $outlet, string $name = 'Notify User'): User
{
    $role = Role::firstOrCreate(['name' => 'Outlet Notify Test Role '.uniqid(), 'guard_name' => 'web']);
    $role->givePermissionTo(Permissions::MEETING_NOTIFY_ALL);

    $user = $outlet ? User::factory()->for($outlet, 'outlet')->create(['name' => $name]) : User::factory()->create(['name' => $name]);
    $user->assignRole($role);

    return $user;
}

test('a notify-all user in a different outlet does not receive the meeting notification', function () {
    Notification::fake();
    $outletB = Outlet::factory()->create();
    $creator = actingAsAdmin();
    $notifyUser = notifyAllUserInOutlet($outletB);
    $client = Client::create(['name' => 'Client', 'phone' => '01700000000']);

    test()->post(route('clients.activities.store', $client), [
        'type' => 'meeting',
        'scheduled_at' => now()->addDay()->format('Y-m-d H:i:s'),
    ])->assertSessionHasNoErrors();

    Notification::assertNotSentTo($notifyUser, MeetingActivityNotification::class);
});

test('a notify-all user in the same outlet as the activity receives the meeting notification', function () {
    Notification::fake();
    $creator = actingAsAdmin();
    $notifyUser = notifyAllUserInOutlet($creator->outlet);
    $client = Client::create(['name' => 'Client', 'phone' => '01700000001']);

    test()->post(route('clients.activities.store', $client), [
        'type' => 'meeting',
        'scheduled_at' => now()->addDay()->format('Y-m-d H:i:s'),
    ])->assertSessionHasNoErrors();

    $activity = ClientActivity::latest('id')->first();

    Notification::assertSentTo($notifyUser, MeetingActivityNotification::class, fn ($n) => $n->activity->id === $activity->id
        && $n->notificationType === MeetingNotificationType::Created);
});

test('a notify-all user who also holds outlets.switch receives the notification regardless of outlet', function () {
    Notification::fake();
    $outletB = Outlet::factory()->create();
    $creator = actingAsAdmin();
    $notifyUser = notifyAllUserInOutlet($outletB);
    $notifyUser->givePermissionTo('outlets.switch');
    $client = Client::create(['name' => 'Client', 'phone' => '01700000002']);

    test()->post(route('clients.activities.store', $client), [
        'type' => 'meeting',
        'scheduled_at' => now()->addDay()->format('Y-m-d H:i:s'),
    ])->assertSessionHasNoErrors();

    Notification::assertSentTo($notifyUser, MeetingActivityNotification::class);
});
