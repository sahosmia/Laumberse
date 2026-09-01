<?php

namespace App\Enums;

enum MeetingNotificationType: string
{
    case Created = 'meeting_created';
    case Updated = 'meeting_updated';
    case Reminder = 'meeting_reminder';
    case Today = 'meeting_today';
}
