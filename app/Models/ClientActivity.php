<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClientActivity extends Model
{
    protected $fillable = [
        'outlet_id',
        'client_id',
        'parent_activity_id',
        'employee_id',
        'created_by',
        'type',
        'scheduled_at',
        'note',
        'status',
        'next_follow_up_date',
        'reminder_minutes',
        'meeting_day_notified_at',
        'reminder_notified_at',
    ];

    protected $casts = [
        'reminder_minutes' => 'integer',
        'meeting_day_notified_at' => 'datetime',
        'reminder_notified_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        // ClientActivityService::logActivity() always resolves outlet_id explicitly via
        // OutletContext::resolveForWrite() before this fires, so this only ever applies to an
        // activity created directly (bypassing the service) without one.
        static::creating(function (ClientActivity $activity) {
            $activity->outlet_id ??= Outlet::query()->oldest('id')->value('id');
        });
    }

    public function outlet()
    {
        return $this->belongsTo(Outlet::class);
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function parent()
    {
        return $this->belongsTo(ClientActivity::class, 'parent_activity_id');
    }

    /** The staff user who logged this meeting/follow-up — always a notification recipient. */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
