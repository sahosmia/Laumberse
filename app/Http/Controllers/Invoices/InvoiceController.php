<?php

namespace App\Http\Controllers\Invoices;

use App\Http\Controllers\Controller;
use App\Http\Requests\Invoices\StoreInvoiceRequest;
use App\Http\Requests\Invoices\UpdateInvoiceRequest;
use App\Http\Requests\Invoices\UpdateInvoiceStatusRequest;
use App\Http\Requests\Invoices\UpdatePaymentStatusRequest;
use App\Models\Account;
use App\Models\Category;
use App\Models\Client;
use App\Models\Invoice;
use App\Models\Product;
use App\Services\InvoiceService;
use App\Support\DateRangeFilter;
use App\Support\OutletContext;
use App\Support\PerPage;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class InvoiceController extends Controller
{
    /** value => [column, direction] — whitelisted so the raw `sort` query param never reaches orderBy(). */
    private const SORTABLE = [
        'created_at:desc' => ['created_at', 'desc'],
        'date:desc' => ['date', 'desc'],
        'date:asc' => ['date', 'asc'],
        'total:desc' => ['total', 'desc'],
        'total:asc' => ['total', 'asc'],
    ];

    public function __construct(protected InvoiceService $invoiceService) {}

    /**
     * Every action that receives a route-bound Invoice must call this first — route model binding
     * alone doesn't scope by outlet, so without this a normal user could reach another outlet's
     * invoice just by guessing/incrementing its id in the URL.
     */
    private function ensureAccessible(Invoice $invoice): void
    {
        if (! OutletContext::canAccess($invoice->outlet_id)) {
            throw new NotFoundHttpException;
        }
    }

    public function index(Request $request)
    {
        [$sortColumn, $sortDirection] = self::SORTABLE[$request->sort] ?? self::SORTABLE['created_at:desc'];
        $perPage = PerPage::resolve($request);

        $invoices = Invoice::with('client')
            ->tap(fn ($q) => OutletContext::scope($q))
            ->when($request->search, fn ($q, $s) => $q->where(function ($q) use ($s) {
                $q->where('invoice_uuid', 'like', "%{$s}%")
                    ->orWhereHas('client', fn ($q) => $q->where('name', 'like', "%{$s}%")
                        ->orWhere('phone', 'like', "%{$s}%"));
            }))
            ->when($request->payment_status, fn ($q, $status) => $q->where('payment_status', $status))
            ->tap(fn ($q) => DateRangeFilter::apply($q, $request))
            ->orderBy($sortColumn, $sortDirection)
            ->orderBy('id', $sortDirection)
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('invoices/index', [
            'invoices' => $invoices,
            'accounts' => Account::tap(fn ($q) => OutletContext::scope($q))->orderBy('name')->get(['id', 'name', 'account_number']),
            'filters' => [
                'search' => $request->search,
                'payment_status' => $request->payment_status,
                'date_filter' => $request->date_filter,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'specific_date' => $request->specific_date,
                'sort' => $request->sort,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('invoices/create', [
            'products' => Product::with(['category', 'outletPrices'])->get(),
            'clients' => Client::with('customPrices')->get(),
            'categories' => Category::all(),
            'accounts' => Account::tap(fn ($q) => OutletContext::scope($q))->orderBy('name')->get(['id', 'name', 'account_number']),
        ]);
    }

    public function store(StoreInvoiceRequest $request)
    {
        try {
            $this->invoiceService->createInvoice($request->validated());

            return redirect()->route('history')->with('success', 'Invoice created successfully.');
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to create invoice.');
        }
    }

    public function edit(Invoice $invoice)
    {
        $this->ensureAccessible($invoice);

        return Inertia::render('invoices/edit', [
            'invoice' => $invoice->load(['items.product'])->makeVisible('internal_note'),
            'products' => Product::with(['category', 'outletPrices'])->get(),
            'clients' => Client::with('customPrices')->get(),
            'categories' => Category::all(),
            'accounts' => Account::tap(fn ($q) => OutletContext::scope($q))->orderBy('name')->get(['id', 'name', 'account_number']),
        ]);
    }

    public function update(UpdateInvoiceRequest $request, Invoice $invoice)
    {
        $this->ensureAccessible($invoice);

        try {
            $this->invoiceService->updateInvoice($invoice, $request->validated());

            return redirect()->route('history')->with('success', 'Invoice updated successfully.');
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to update invoice.');
        }
    }

    public function show(Invoice $invoice)
    {
        $this->ensureAccessible($invoice);

        return Inertia::render('invoices/show', [
            'invoice' => $invoice->load(['client', 'items.product'])->makeVisible('internal_note'),
            'accounts' => Account::tap(fn ($q) => OutletContext::scope($q))->orderBy('name')->get(['id', 'name', 'account_number']),
            'histories' => $invoice->histories()->with('user:id,name')->get(),
        ]);
    }

    public function destroy(Invoice $invoice)
    {
        $this->ensureAccessible($invoice);

        try {
            $this->invoiceService->deleteInvoice($invoice);

            return redirect()->back()->with('success', 'Invoice deleted successfully.');
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to delete invoice.');
        }
    }

    public function updateStatus(UpdateInvoiceStatusRequest $request, Invoice $invoice)
    {
        $this->ensureAccessible($invoice);

        try {
            $this->invoiceService->updateStatus($invoice, $request->validated()['status']);

            return redirect()->back()->with('success', 'Invoice status updated successfully.');
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to update invoice status.');
        }
    }

    public function updatePaymentStatus(UpdatePaymentStatusRequest $request, Invoice $invoice)
    {
        $this->ensureAccessible($invoice);

        try {
            $validated = $request->validated();
            $this->invoiceService->updatePaymentStatus($invoice, $validated['payment_status'], $validated['account_id'] ?? null);

            return redirect()->back()->with('success', 'Payment status updated successfully.');
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to update payment status.');
        }
    }

    public function print(Request $request, Invoice $invoice)
    {
        $this->ensureAccessible($invoice);

        $invoice->load(['client', 'items.product']);
        $pdf = Pdf::loadView('invoices.pdf', compact('invoice'));
        $filename = 'invoice-'.$invoice->invoice_uuid.'.pdf';

        // Print opens the PDF inline so the browser's own viewer can print it; Download
        // (?download=1) forces an actual Save-As instead of just opening another inline tab.
        return $request->boolean('download')
            ? $pdf->download($filename)
            : $pdf->stream($filename);
    }

    /**
     * A narrow 80mm receipt layout for POS thermal printers — a plain HTML page (not a PDF, since
     * thermal printers print via the OS/browser print dialog directly), auto-triggers
     * window.print() on load. Separate from print() above, which renders the full A4 PDF.
     */
    public function posPrint(Invoice $invoice)
    {
        $this->ensureAccessible($invoice);

        return Inertia::render('invoices/pos', [
            'invoice' => $invoice->load(['client', 'items.product']),
        ]);
    }
}
