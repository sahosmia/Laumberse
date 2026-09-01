<?php

namespace App\Services;

use App\Actions\Meetings\ResolveMeetingNotificationRecipientsAction;
use App\Enums\MeetingNotificationType;
use App\Models\Client;
use App\Models\ClientActivity;
use App\Notifications\MeetingActivityNotification;
use App\Support\OutletContext;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

class ClientActivityService
{
    public function __construct(
        private ResolveMeetingNotificationRecipientsAction $resolveRecipients,
    ) {}

    public function logActivity(Client $client, array $data, ?int $createdBy = null): ClientActivity
    {
        $activity = DB::transaction(function () use ($client, $data, $createdBy) {
            $outletId = OutletContext::resolveForWrite($data['outlet_id'] ?? null);
            $activity = $client->activities()->create([...$data, 'outlet_id' => $outletId, 'created_by' => $createdBy]);

            if (! empty($data['next_follow_up_date'])) {
                $client->activities()->create([
                    'outlet_id' => $outletId,
                    'parent_activity_id' => $activity->id,
                    'employee_id' => $data['employee_id'] ?? null,
                    'created_by' => $createdBy,
                    'type' => 'follow_up',
                    'scheduled_at' => Carbon::parse($data['next_follow_up_date'])->startOfDay(),
                    'note' => 'Auto-scheduled follow-up from '.$data['type'].' on '.Carbon::parse($data['scheduled_at'])->format('Y-m-d'),
                    'status' => 'pending',
                ]);
            }

            return $activity;
        });

        // Dispatched only after the transaction has committed, so a notification never
        // references an activity that failed to persist.
        $this->notify($activity, MeetingNotificationType::Created);

        return $activity;
    }

    /**
     * Updates an activity and notifies recipients only when scheduling information that
     * actually matters to them changed (date, time, or reminder) — not for unrelated field
     * edits like a note or assignment change. Resets the scheduled-notification dedupe flags
     * so a reschedule can't leave a stale "already notified" state behind.
     */
    public function updateActivity(ClientActivity $activity, array $data): ClientActivity
    {
        $originalScheduledAt = Carbon::parse($activity->scheduled_at);
        $originalReminderMinutes = $activity->reminder_minutes;

        DB::transaction(function () use ($activity, $data) {
            $activity->update($data);
        });

        $activity->refresh();

        $newScheduledAt = Carbon::parse($activity->scheduled_at);
        $dateChanged = ! $originalScheduledAt->isSameDay($newScheduledAt);
        $scheduledAtChanged = ! $originalScheduledAt->equalTo($newScheduledAt);
        $reminderChanged = $originalReminderMinutes !== $activity->reminder_minutes;

        if ($dateChanged) {
            $activity->forceFill(['meeting_day_notified_at' => null])->saveQuietly();
        }

        if ($scheduledAtChanged || $reminderChanged) {
            $activity->forceFill(['reminder_notified_at' => null])->saveQuietly();
        }

        if ($scheduledAtChanged || $reminderChanged) {
            $this->notify($activity, MeetingNotificationType::Updated);
        }

        return $activity;
    }

    private function notify(ClientActivity $activity, MeetingNotificationType $notificationType): void
    {
        $recipients = ($this->resolveRecipients)($activity);

        if ($recipients->isNotEmpty()) {
            Notification::send($recipients, new MeetingActivityNotification($activity, $notificationType));
        }
    }
}
