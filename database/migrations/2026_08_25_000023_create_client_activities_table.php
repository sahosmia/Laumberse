<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('client_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->nullable()->constrained()->nullOnDelete();
            // The staff user who logged this meeting/follow-up — the "Meeting Creator" for
            // notification-recipient resolution. Nullable so auto-scheduled child follow-ups
            // (created by the system, not a specific user action) don't need one.
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('type', ['meeting', 'follow_up']);
            $table->dateTime('scheduled_at');
            $table->text('note')->nullable();
            $table->enum('status', ['pending', 'done', 'cancelled'])->default('pending');
            $table->date('next_follow_up_date')->nullable();
            // Minutes before scheduled_at to send a reminder notification; null = no reminder.
            $table->unsignedInteger('reminder_minutes')->nullable();
            // Dedupe flags for the scheduled due-check command (see SendMeetingNotifications) —
            // reset to null whenever the relevant schedule changes so a reschedule can fire again.
            $table->timestamp('meeting_day_notified_at')->nullable();
            $table->timestamp('reminder_notified_at')->nullable();
            $table->timestamps();
        });

        Schema::table('client_activities', function (Blueprint $table) {
            // Set when this row was auto-scheduled from another activity's next_follow_up_date.
            // Self-referencing, so it's added after the table exists rather than inline.
            $table->foreignId('parent_activity_id')->nullable()->after('client_id')
                ->constrained('client_activities')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('client_activities');
    }
};
