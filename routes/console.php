<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Meeting-day (8:00 AM) and reminder notifications — re-checks live activity state every
// run, so a reschedule/cancellation naturally takes effect without any job invalidation.
Schedule::command('meetings:send-due-notifications')->everyFiveMinutes()->withoutOverlapping();
