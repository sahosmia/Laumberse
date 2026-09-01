<?php

namespace App\Http\Controllers\Clients;

use App\Http\Controllers\Controller;
use App\Http\Requests\Clients\StoreClientActivityRequest;
use App\Http\Requests\Clients\UpdateClientActivityRequest;
use App\Models\Client;
use App\Models\ClientActivity;
use App\Models\Employee;
use App\Services\ClientActivityService;
use App\Support\DateRangeFilter;
use App\Support\OutletContext;
use App\Support\PerPage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ClientActivityController extends Controller
{
    /** value => [column, direction] — whitelisted so the raw `sort` query param never reaches orderBy(). */
    private const SORTABLE = [
        'scheduled_at:desc' => ['scheduled_at', 'desc'],
        'scheduled_at:asc' => ['scheduled_at', 'asc'],
    ];

    /** Every action that receives a route-bound ClientActivity must call this first — see InvoiceController::ensureAccessible(). */
    private function ensureAccessible(ClientActivity $activity): void
    {
        if (! OutletContext::canAccess($activity->outlet_id)) {
            throw new NotFoundHttpException;
        }
    }

    /** All meetings/follow-ups across every client — the sidebar's "Meetings & Follow-ups" list. */
    public function index(Request $request)
    {
        [$sortColumn, $sortDirection] = self::SORTABLE[$request->sort] ?? self::SORTABLE['scheduled_at:desc'];
        $perPage = PerPage::resolve($request);

        $activities = ClientActivity::query()
            ->tap(fn ($q) => OutletContext::scope($q))
            ->with(['client:id,name', 'employee:id,name', 'creator:id,name'])
            ->when($request->search, fn ($q, $s) => $q->where('note', 'like', "%{$s}%")
                ->orWhereHas('client', fn ($q) => $q->where('name', 'like', "%{$s}%")))
            ->when($request->type, fn ($q, $type) => $q->where('type', $type))
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->tap(fn ($q) => DateRangeFilter::apply($q, $request, 'scheduled_at'))
            ->orderBy($sortColumn, $sortDirection)
            ->orderBy('id', $sortDirection)
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('meetings/index', [
            'activities' => $activities,
            'clients' => Client::orderBy('name')->get(['id', 'name']),
            'employees' => Employee::tap(fn ($q) => OutletContext::scope($q))->orderBy('name')->get(['id', 'name']),
            'filters' => [
                'search' => $request->search,
                'type' => $request->type,
                'status' => $request->status,
                'date_filter' => $request->date_filter,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'specific_date' => $request->specific_date,
                'sort' => $request->sort,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(StoreClientActivityRequest $request, Client $client, ClientActivityService $clientActivityService)
    {
        try {
            $clientActivityService->logActivity($client, $request->validated(), $request->user()?->id);

            return redirect()->back()->with('success', 'Activity added successfully.');
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to add activity.');
        }
    }

    public function update(UpdateClientActivityRequest $request, Client $client, ClientActivity $activity, ClientActivityService $clientActivityService)
    {
        $this->ensureAccessible($activity);

        try {
            $clientActivityService->updateActivity($activity, $request->validated());

            return redirect()->back()->with('success', 'Activity updated successfully.');
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to update activity.');
        }
    }

    public function destroy(Client $client, ClientActivity $activity)
    {
        $this->ensureAccessible($activity);

        try {
            $activity->delete();

            return redirect()->back()->with('success', 'Activity deleted successfully.');
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to delete activity.');
        }
    }
}
