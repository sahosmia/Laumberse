<?php

namespace App\Console\Commands;

use App\Actions\Meetings\ResolveMeetingNotificationRecipientsAction;
use App\Enums\MeetingNotificationType;
use App\Models\ClientActivity;
use App\Notifications\MeetingActivityNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Notification;

/**
 * Server-driven meeting-day (8:00 AM) and reminder notification delivery.
 *
 * Deliberately re-evaluates live activity state on every run instead of dispatching
 * pre-scheduled jobs at creation time: this is what makes a reschedule, cancellation, or
 * server restart "just work" with zero invalidation bookkeeping — there's no stale payload
 * to go stale, since the due-check always reads the current row. Each activity is guarded
 * against duplicate sends by its own *_notified_at flag, reset by
 * ClientActivityService::updateActivity() whenever the relevant schedule changes.
 */
class SendMeetingNotifications extends Command
{
    protected $signature = 'meetings:send-due-notifications';

    protected $description = 'Send meeting-day (8:00 AM) and reminder notifications for due meetings/follow-ups.';

    public function handle(ResolveMeetingNotificationRecipientsAction $resolveRecipients): void
    {
        $now = now();

        $this->sendMeetingDayNotifications($now, $resolveRecipients);
        $this->sendReminderNotifications($now, $resolveRecipients);
    }

    private function sendMeetingDayNotifications(Carbon $now, ResolveMeetingNotificationRecipientsAction $resolveRecipients): void
    {
        if ($now->hour < 8) {
            return;
        }

        ClientActivity::query()
            ->whereNull('meeting_day_notified_at')
            ->whereNotIn('status', ['cancelled', 'done'])
            ->whereDate('scheduled_at', $now->toDateString())
            ->get()
            ->each(function (ClientActivity $activity) use ($resolveRecipients) {
                $this->dispatch($activity, MeetingNotificationType::Today, $resolveRecipients);
                $activity->forceFill(['meeting_day_notified_at' => now()])->saveQuietly();
            });
    }

    private function sendReminderNotifications(Carbon $now, ResolveMeetingNotificationRecipientsAction $resolveRecipients): void
    {
        ClientActivity::query()
            ->whereNull('reminder_notified_at')
            ->whereNotNull('reminder_minutes')
            ->whereNotIn('status', ['cancelled', 'done'])
            ->where('scheduled_at', '>', $now)
            ->get()
            ->filter(fn (ClientActivity $activity) => $now->greaterThanOrEqualTo(
                Carbon::parse($activity->scheduled_at)->subMinutes($activity->reminder_minutes)
            ))
            ->each(function (ClientActivity $activity) use ($resolveRecipients) {
                $this->dispatch($activity, MeetingNotificationType::Reminder, $resolveRecipients);
                $activity->forceFill(['reminder_notified_at' => now()])->saveQuietly();
            });
    }

    private function dispatch(ClientActivity $activity, MeetingNotificationType $type, ResolveMeetingNotificationRecipientsAction $resolveRecipients): void
    {
        $recipients = $resolveRecipients($activity);

        if ($recipients->isNotEmpty()) {
            Notification::send($recipients, new MeetingActivityNotification($activity, $type));
        }
    }
}
