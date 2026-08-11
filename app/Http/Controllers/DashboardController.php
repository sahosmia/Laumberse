<?php

namespace App\Http\Controllers;

use App\Actions\Dashboard\GetDashboardMetricsAction;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request, GetDashboardMetricsAction $action)
    {
        $metrics = $action($request->query('period'), $request->query('from'), $request->query('to'));

        return Inertia::render('dashboard', $metrics);
    }
}
