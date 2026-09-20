<?php

namespace App\Http\Controllers\Invoices;

use App\Actions\Invoices\PrepareInvoicePdfDataAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Invoices\CancelInvoiceRequest;
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
use App\Support\BusinessInfo;
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

        $invoices = Invoice::with(['client', 'outlet:id,name,code'])
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
            'invoices' => Inertia::merge($invoices)->append('data', 'id'),
            // outlet_id included so the per-row "Mark as Paid" account picker can filter down to
            // that specific invoice's own outlet — this list otherwise spans every outlet while
            // viewing "All Outlets", but a single invoice can only ever be paid into its own.
            'accounts' => Account::tap(fn ($q) => OutletContext::scope($q))->orderBy('name')->get(['id', 'name', 'account_number', 'outlet_id']),
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
            // outlet_id included so the create form can filter this list down to whichever outlet
            // is picked below while viewing "All Outlets" (see invoice-form.tsx's effectiveOutlet).
            'accounts' => Account::tap(fn ($q) => OutletContext::scope($q))->orderBy('name')->get(['id', 'name', 'account_number', 'outlet_id']),
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
            // This invoice's outlet is fixed (see UpdateInvoiceRequest's own account_id rule) —
            // scoped to it directly rather than the viewer's own session outlet, which would be
            // wrong while viewing "All Outlets" or a *different* single outlet than this invoice's.
            'accounts' => Account::where('outlet_id', $invoice->outlet_id)->orderBy('name')->get(['id', 'name', 'account_number']),
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

        $invoice->load(['client', 'items.product', 'outlet:id,name,code,address,phone'])->makeVisible('internal_note');

        return Inertia::render('invoices/show', [
            'invoice' => $invoice,
            // Scoped to this invoice's own fixed outlet — see UpdatePaymentStatusRequest's
            // account_id rule, and the same reasoning in edit() above.
            'accounts' => Account::where('outlet_id', $invoice->outlet_id)->orderBy('name')->get(['id', 'name', 'account_number']),
            'histories' => $invoice->histories()->with('user:id,name')->get(),
            // Resolved per this invoice's own outlet — see BusinessInfo's docblock.
            'business' => [
                'name' => BusinessInfo::name(),
                'address' => BusinessInfo::address($invoice->outlet),
                'phone' => BusinessInfo::phone($invoice->outlet),
                'logo_url' => BusinessInfo::logoUrl(),
            ],
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

    public function cancelOrder(CancelInvoiceRequest $request, Invoice $invoice)
    {
        $this->ensureAccessible($invoice);

        try {
            $this->invoiceService->cancelOrder($invoice);

            return redirect()->back()->with('success', 'Order cancelled successfully.');
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to cancel order.');
        }
    }

    public function print(Request $request, Invoice $invoice, PrepareInvoicePdfDataAction $preparePdfData)
    {
        $this->ensureAccessible($invoice);

        $pdf = Pdf::loadView('invoices.pdf', $preparePdfData($invoice));
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

        $invoice->load(['client', 'items.product', 'outlet:id,name,code,address,phone']);

        return Inertia::render('invoices/pos', [
            'invoice' => $invoice,
            'business' => [
                'name' => BusinessInfo::name(),
                'address' => BusinessInfo::address($invoice->outlet),
                'phone' => BusinessInfo::phone($invoice->outlet),
            ],
        ]);
    }
}
