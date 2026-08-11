<?php

namespace App\Http\Controllers\Reports;

use App\Actions\Reports\GetReportSummaryAction;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(GetReportSummaryAction $action)
    {
        return Inertia::render('reports/index', $action());
    }
}
