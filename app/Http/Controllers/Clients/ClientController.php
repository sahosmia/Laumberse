<?php

namespace App\Http\Controllers\Clients;

use App\Actions\Clients\CreateClientAction;
use App\Actions\Clients\UpdateClientAction;
use App\Exceptions\HasDependentRecordsException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Clients\StoreClientRequest;
use App\Http\Requests\Clients\UpdateClientRequest;
use App\Models\Client;
use App\Models\Employee;
use App\Models\Outlet;
use App\Models\Product;
use App\Support\DateRangeFilter;
use App\Support\OutletContext;
use App\Support\PerPage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClientController extends Controller
{
    /** value => [column, direction] — whitelisted so the raw `sort` query param never reaches orderBy(). */
    private const SORTABLE = [
        'created_at:desc' => ['created_at', 'desc'],
        'name:asc' => ['name', 'asc'],
        'name:desc' => ['name', 'desc'],
        'total_due:desc' => ['total_due', 'desc'],
        'total_due:asc' => ['total_due', 'asc'],
    ];

    public function index(Request $request)
    {
        [$sortColumn, $sortDirection] = self::SORTABLE[$request->sort] ?? self::SORTABLE['created_at:desc'];
        $perPage = PerPage::resolve($request);

        $clients = Client::with(['customPrices', 'outlet:id,name,code'])
            ->when($request->search, fn ($q, $s) => $q->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                    ->orWhere('phone', 'like', "%{$s}%")
                    ->orWhere('client_uuid', 'like', "%{$s}%");
            }))
            ->when($request->type, fn ($q, $type) => $q->where('type', $type))
            // Client is global (not outlet-scoped), so this filter is opt-in for "how many clients
            // does this outlet have" — not an access restriction like OutletContext::scope().
            ->when($request->outlet_id, fn ($q, $outletId) => $q->where('outlet_id', $outletId))
            ->orderBy($sortColumn, $sortDirection)
            ->orderBy('id', $sortDirection)
            ->paginate($perPage)
            ->withQueryString();

        // Staff-only field, hidden by default on the model — this is a staff page, so surface it
        // (the create/edit modal reads a client's current note straight from this list).
        $clients->getCollection()->makeVisible('internal_note');

        return Inertia::render('clients/index', [
            'clients' => $clients,
            'products' => Product::all(),
            // Every active outlet, not just the current user's — any staff member may create or
            // edit a client under any outlet, unrelated to which outlet they're currently viewing.
            'outlets' => Outlet::where('status', 'active')->orderBy('name')->get(['id', 'name']),
            'filters' => [
                'search' => $request->search,
                'type' => $request->type,
                'outlet_id' => $request->outlet_id,
                'sort' => $request->sort,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(StoreClientRequest $request, CreateClientAction $action)
    {
        try {
            $action($request->validated());

            return redirect()->back()->with('success', 'Client created successfully.');
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to create client.');
        }
    }

    public function show(Request $request, Client $client)
    {
        $orderPerPage = PerPage::resolve($request, 20, 'order_per_page');
        $activityPerPage = PerPage::resolve($request, 20, 'activity_per_page');

        $orders = $client->invoices()
            ->tap(fn ($q) => OutletContext::scope($q))
            ->with('items.product')
            ->when($request->order_search, fn ($q, $s) => $q->where('invoice_uuid', 'like', "%{$s}%"))
            ->tap(fn ($q) => DateRangeFilter::apply($q, $request, 'date', 'order'))
            ->latest('date')
            ->latest('id')
            ->paginate($orderPerPage, ['*'], 'orders_page')
            ->withQueryString();

        $activities = $client->activities()
            ->tap(fn ($q) => OutletContext::scope($q))
            ->with(['employee', 'creator:id,name'])
            ->when($request->activity_search, fn ($q, $s) => $q->where('note', 'like', "%{$s}%"))
            ->tap(fn ($q) => DateRangeFilter::apply($q, $request, 'scheduled_at', 'activity'))
            ->latest('scheduled_at')
            ->paginate($activityPerPage, ['*'], 'activities_page')
            ->withQueryString();

        return Inertia::render('clients/show', [
            'client' => $client->load(['customPrices.product', 'outlet:id,name,code'])->makeVisible('internal_note'),
            'orders' => $orders,
            'activities' => $activities,
            'employees' => Employee::tap(fn ($q) => OutletContext::scope($q))->orderBy('name')->get(['id', 'name']),
            'orderFilters' => [
                'search' => $request->order_search,
                'per_page' => $orderPerPage,
                'date_filter' => $request->order_date_filter,
                'start_date' => $request->order_start_date,
                'end_date' => $request->order_end_date,
                'specific_date' => $request->order_specific_date,
            ],
            'activityFilters' => [
                'search' => $request->activity_search,
                'per_page' => $activityPerPage,
                'date_filter' => $request->activity_date_filter,
                'start_date' => $request->activity_start_date,
                'end_date' => $request->activity_end_date,
                'specific_date' => $request->activity_specific_date,
            ],
        ]);
    }

    public function update(UpdateClientRequest $request, Client $client, UpdateClientAction $action)
    {
        try {
            $action($client, $request->validated());

            return redirect()->back()->with('success', 'Client updated successfully.');
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to update client.');
        }
    }

    public function destroy(Client $client)
    {
        try {
            if ($client->invoices()->exists()) {
                throw new HasDependentRecordsException($client->name, 'existing orders in their history');
            }

            $client->delete();

            return redirect()->back()->with('success', 'Client deleted successfully.');
        } catch (HasDependentRecordsException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to delete client.');
        }
    }
}
