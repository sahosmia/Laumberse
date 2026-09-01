<?php

namespace App\Notifications;

use App\Enums\MeetingNotificationType;
use App\Models\ClientActivity;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Carbon;

/**
 * Deliberately NOT ShouldQueue: QUEUE_CONNECTION is 'database' but no queue worker process
 * runs anywhere in this project (no Procfile/supervisor config), so a queued notification
 * would sit unprocessed forever. A database-notification write is a fast single INSERT, not
 * a slow external call, so synchronous delivery is both correct and safe here. If a real
 * queue worker is ever set up, this can implement ShouldQueue again with no other changes.
 */
class MeetingActivityNotification extends Notification
{
    public function __construct(
        public ClientActivity $activity,
        public MeetingNotificationType $notificationType,
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'notification_type' => $this->notificationType->value,
            'activity_id' => $this->activity->id,
            'activity_type' => $this->activity->type,
            'client_id' => $this->activity->client_id,
            'client_name' => $this->activity->client?->name,
            'title' => $this->title(),
            'message' => $this->message(),
            'scheduled_at' => $this->activity->scheduled_at,
            'url' => route('clients.show', $this->activity->client_id),
        ];
    }

    private function typeLabel(): string
    {
        return $this->activity->type === 'meeting' ? 'meeting' : 'follow-up';
    }

    private function clientName(): string
    {
        return $this->activity->client?->name ?? 'a client';
    }

    private function scheduledAt(): Carbon
    {
        return Carbon::parse($this->activity->scheduled_at);
    }

    private function title(): string
    {
        return match ($this->notificationType) {
            MeetingNotificationType::Created => ucfirst($this->typeLabel()).' scheduled',
            MeetingNotificationType::Updated => ucfirst($this->typeLabel()).' rescheduled',
            MeetingNotificationType::Reminder => 'Upcoming '.$this->typeLabel(),
            MeetingNotificationType::Today => "Today's ".$this->typeLabel(),
        };
    }

    private function message(): string
    {
        $when = $this->scheduledAt()->format('M j, Y \a\t g:i A');
        $time = $this->scheduledAt()->format('g:i A');

        return match ($this->notificationType) {
            MeetingNotificationType::Created => "New {$this->typeLabel()} scheduled with {$this->clientName()} for {$when}.",
            MeetingNotificationType::Updated => ucfirst($this->typeLabel())." with {$this->clientName()} has been rescheduled to {$when}.",
            MeetingNotificationType::Reminder => "Reminder: {$this->typeLabel()} with {$this->clientName()} starts in {$this->activity->reminder_minutes} minutes.",
            MeetingNotificationType::Today => "Today's {$this->typeLabel()}: {$this->clientName()} at {$time}.",
        };
    }
}
