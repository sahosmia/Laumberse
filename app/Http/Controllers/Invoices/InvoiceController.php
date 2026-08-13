<?php

namespace App\Http\Controllers\Invoices;

use App\Http\Controllers\Controller;
use App\Http\Requests\Invoices\StoreInvoiceRequest;
use App\Http\Requests\Invoices\UpdateInvoiceRequest;
use App\Http\Requests\Invoices\UpdateInvoiceStatusRequest;
use App\Http\Requests\Invoices\UpdatePaymentStatusRequest;
use App\Models\Category;
use App\Models\Invoice;
use App\Models\Product;
use App\Models\Client;
use App\Services\InvoiceService;
use App\Support\DateRangeFilter;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    public function __construct(protected InvoiceService $invoiceService)
    {
    }

    public function index(Request $request)
    {
        $invoices = Invoice::with('client')
            ->when($request->search, fn($q, $s) => $q->where(function ($q) use ($s) {
                $q->where('invoice_uuid', 'like', "%{$s}%")
                    ->orWhereHas('client', fn($q) => $q->where('name', 'like', "%{$s}%"));
            }))
            ->when($request->payment_status, fn($q, $status) => $q->where('payment_status', $status))
            ->tap(fn($q) => DateRangeFilter::apply($q, $request))
            ->latest()
            ->paginate(50)
            ->withQueryString();

        return Inertia::render('invoices/index', [
            'invoices' => $invoices,
            'filters' => [
                'search' => $request->search,
                'payment_status' => $request->payment_status,
                'date_filter' => $request->date_filter,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
            ],
        ]);
    }

    public function create( )
    {
        return Inertia::render('invoices/create', [
            'products' => Product::with(['category', 'unit'])->get(),
            'clients' => Client::with('customPrices')->get(),
            'categories' => Category::all(),
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
            'products' => Product::with(['category', 'unit'])->get(),
            'clients' => Client::with('customPrices')->get(),
            'categories' => Category::all(),
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

    public function updateStatus(UpdateInvoiceStatusRequest $request, Invoice $invoice)
    {
        $validated = $request->validated();

        $invoice->update(['status' => $validated['status']]);

        return redirect()->back()->with('success', 'Invoice status updated successfully.');
    }

    public function updatePaymentStatus(UpdatePaymentStatusRequest $request, Invoice $invoice)
    {
        $this->invoiceService->updatePaymentStatus($invoice, $request->validated()['payment_status']);
        return redirect()->back()->with('success', 'Payment status updated successfully.');
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
