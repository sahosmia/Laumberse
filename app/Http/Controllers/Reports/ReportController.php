<?php

namespace App\Http\Controllers\Reports;

use App\Actions\Reports\GetReportSummaryAction;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $request, GetReportSummaryAction $action)
    {
        $summary = $action($request->query('period'), $request->query('from'), $request->query('to'));

        return Inertia::render('reports/index', $summary);
    }
}
