<?php

namespace App\Http\Controllers\Outlets;

use App\Http\Controllers\Controller;
use App\Http\Requests\Outlets\StoreOutletRequest;
use App\Http\Requests\Outlets\UpdateOutletRequest;
use App\Models\Outlet;
use App\Support\PerPage;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * No destroy() — outlets are never destructively deleted, only deactivated (status=inactive)
 * via update(), since outlet-scoped financial/business history must always remain attributable
 * to a real outlet record.
 */
class OutletController extends Controller
{
    /** value => [column, direction] — whitelisted so the raw `sort` query param never reaches orderBy(). */
    private const SORTABLE = [
        'created_at:desc' => ['created_at', 'desc'],
        'name:asc' => ['name', 'asc'],
        'name:desc' => ['name', 'desc'],
    ];

    public function index(Request $request)
    {
        [$sortColumn, $sortDirection] = self::SORTABLE[$request->sort] ?? self::SORTABLE['created_at:desc'];
        $perPage = PerPage::resolve($request);

        $outlets = Outlet::when($request->search, fn ($q, $s) => $q->where(function ($q) use ($s) {
            $q->where('name', 'like', "%{$s}%")->orWhere('code', 'like', "%{$s}%");
        }))
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->orderBy($sortColumn, $sortDirection)
            ->orderBy('id', $sortDirection)
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('outlets/index', [
            'outlets' => $outlets,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
                'sort' => $request->sort,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(StoreOutletRequest $request)
    {
        try {
            Outlet::create($request->validated());

            return redirect()->back()->with('success', 'Outlet created successfully.');
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to create outlet.');
        }
    }

    public function update(UpdateOutletRequest $request, Outlet $outlet)
    {
        try {
            $outlet->update($request->validated());

            return redirect()->back()->with('success', 'Outlet updated successfully.');
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to update outlet.');
        }
    }
}
