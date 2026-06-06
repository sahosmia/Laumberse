<?php

namespace App\Http\Controllers\Invoices;

use App\Http\Controllers\Controller;
use App\Http\Requests\Invoices\StoreInvoiceRequest;
use App\Http\Requests\Invoices\UpdateInvoiceRequest;
use App\Models\Invoice;
use App\Models\Outlet;
use App\Models\Product;
use App\Models\Client;
use App\Services\InvoiceService;
use Barryvdh\DomPDF\Facade\Pdf;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    protected $invoiceService;

    public function __construct(InvoiceService $invoiceService)
    {
        $this->invoiceService = $invoiceService;
    }

    public function index()
    {
        return Inertia::render('invoices/index', [
            'invoices' => Invoice::with('client')->orderBy('date', 'desc')->get(),
        ]);
    }

    public function create( )
    {
        return Inertia::render('invoices/create', [
            'products' => Product::with(['category', 'unit', 'outletPrices'])->get(),
            'clients' => Client::with('customPrices')->get(),
            'categories' => \App\Models\Category::all(),
            'outlets' => Outlet::all(),
            // 'invoice' => CustomerProductPrice::where('customer_id', $request()->query('client_id'))->get(),
        ]);
    }

    public function store(StoreInvoiceRequest $request)
    {
        $this->invoiceService->createInvoice($request->validated());
        return redirect()->route('history')->with('success', 'Invoice created successfully.');
    }

    public function edit(Invoice $invoice)
    {
        return Inertia::render('invoices/edit', [
            'invoice' => $invoice->load(['items.product']),
            'products' => Product::with(['category', 'unit', 'outletPrices'])->get(),
            'clients' => Client::with('customPrices')->get(),
            'categories' => \App\Models\Category::all(),
            'outlets' => Outlet::all(),
        ]);
    }

    public function update(UpdateInvoiceRequest $request, Invoice $invoice)
    {
        $this->invoiceService->updateInvoice($invoice, $request->validated());
        return redirect()->route('history')->with('success', 'Invoice updated successfully.');
    }

    public function show(Invoice $invoice)
    {
        return Inertia::render('invoices/show', [
            'invoice' => $invoice->load(['client', 'items.product']),
        ]);
    }

    public function destroy(Invoice $invoice)
    {
        $invoice->delete();
        return redirect()->back()->with('success', 'Invoice deleted successfully.');
    }

    public function updateStatus(\Illuminate\Http\Request $request, Invoice $invoice)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:Pending,Delivered,Cancelled,Processing,In House',
        ]);

        $invoice->update(['status' => $validated['status']]);

        return redirect()->back()->with('success', 'Invoice status updated successfully.');
    }

     public function print(Invoice $invoice)
    {
        $invoice->load(['client', 'items.product']);
        $pdf = Pdf::loadView('invoices.pdf', compact('invoice'));
        return $pdf->stream('invoice-' . $invoice->invoice_uuid . '.pdf');
    }

     public function bulkDestroy(\Illuminate\Http\Request $request)
    {
        $ids = $request->input('ids');
        if (empty($ids)) {
            Invoice::query()->delete();
            return redirect()->back()->with('success', 'All invoices deleted successfully.');
        }

        Invoice::whereIn('id', $ids)->delete();
        return redirect()->back()->with('success', 'Selected invoices deleted successfully.');
    }
}
