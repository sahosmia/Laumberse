<?php

namespace App\Http\Controllers;

use App\Models\Payroll;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PayrollController extends Controller
{
    public function index()
    {
        $payrolls = Payroll::with(['employee', 'expense'])->latest()->paginate(15);

        return Inertia::render('payrolls/index', [
            'payrolls' => $payrolls
        ]);
    }
}
