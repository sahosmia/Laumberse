<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ActivityController extends Controller
{
    public function index()
    {
        $client = Auth::guard('client')->user();

        $activities = $client->activities()
            ->latest('scheduled_at')
            ->paginate(20);

        return Inertia::render('portal/activities/index', [
            'activities' => $activities,
        ]);
    }
}
