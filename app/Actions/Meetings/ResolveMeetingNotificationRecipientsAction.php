<?php

namespace App\Actions\Meetings;

use App\Models\ClientActivity;
use App\Models\User;
use App\Support\Permissions;
use Illuminate\Database\Eloquent\Collection;

/**
 * The single source of truth for "who gets notified about this meeting/follow-up."
 *
 * Recipients = the activity's creator (always, regardless of outlet — it's their own action) +
 * every user holding the Permissions::MEETING_NOTIFY_ALL permission who can actually see this
 * activity: either they hold outlets.switch (an Admin/cross-outlet overseer, who should still be
 * notified about every outlet) or their own assigned outlet matches the activity's outlet.
 * Deduplicated by user id. This class only resolves the recipient list — it never sends
 * notifications, schedules reminders, or touches the activity itself.
 */
class ResolveMeetingNotificationRecipientsAction
{
    /**
     * @return Collection<int, User>
     */
    public function __invoke(ClientActivity $activity): Collection
    {
        $recipients = new Collection;

        if ($activity->creator) {
            $recipients->push($activity->creator);
        }

        $notifyAll = User::query()->permission(Permissions::MEETING_NOTIFY_ALL)->get()
            ->filter(fn (User $user) => $user->can('outlets.switch') || $user->outlet_id === $activity->outlet_id);

        $recipients = $recipients->merge($notifyAll);

        return $recipients->unique('id')->values();
    }
}
