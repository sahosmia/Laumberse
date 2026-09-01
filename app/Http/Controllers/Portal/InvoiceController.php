<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    public function index()
    {
        $client = Auth::guard('client')->user();

        $invoices = $client->invoices()
            ->latest('date')
            ->paginate(20);

        return Inertia::render('portal/invoices/index', [
            'invoices' => $invoices,
        ]);
    }

    public function show(Invoice $invoice)
    {
        abort_unless($invoice->client_id === Auth::guard('client')->id(), 403);

        return Inertia::render('portal/invoices/show', [
            'invoice' => $invoice->load('items.product'),
        ]);
    }
}
