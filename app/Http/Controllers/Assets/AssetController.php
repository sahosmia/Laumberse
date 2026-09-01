<?php

namespace App\Http\Controllers\Assets;

use App\Actions\Assets\CreateAssetAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Assets\StoreAssetRequest;
use App\Http\Requests\Assets\UpdateAssetRequest;
use App\Models\Account;
use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\GlobalSetting;
use App\Support\DateRangeFilter;
use App\Support\OutletContext;
use App\Support\PerPage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class AssetController extends Controller
{
    /** value => [column, direction] — whitelisted so the raw `sort` query param never reaches orderBy(). */
    private const SORTABLE = [
        'created_at:desc' => ['created_at', 'desc'],
        'name:asc' => ['name', 'asc'],
        'name:desc' => ['name', 'desc'],
        'cost:desc' => ['cost', 'desc'],
        'cost:asc' => ['cost', 'asc'],
    ];

    /** Every action that receives a route-bound Asset must call this first — see InvoiceController::ensureAccessible(). */
    private function ensureAccessible(Asset $asset): void
    {
        if (! OutletContext::canAccess($asset->outlet_id)) {
            throw new NotFoundHttpException;
        }
    }

    public function index(Request $request)
    {
        [$sortColumn, $sortDirection] = self::SORTABLE[$request->sort] ?? self::SORTABLE['created_at:desc'];
        $perPage = PerPage::resolve($request);

        $assets = Asset::with('category')
            ->tap(fn ($q) => OutletContext::scope($q))
            ->when($request->search, fn ($q, $s) => $q->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                    ->orWhere('description', 'like', "%{$s}%")
                    ->orWhereHas('category', fn ($q) => $q->where('name', 'like', "%{$s}%"));
            }))
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->tap(fn ($q) => DateRangeFilter::apply($q, $request, 'purchase_date'))
            ->orderBy($sortColumn, $sortDirection)
            ->orderBy('id', $sortDirection)
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('assets/index', [
            'assets' => $assets,
            'categories' => AssetCategory::orderBy('name')->get(),
            'accounts' => Account::tap(fn ($q) => OutletContext::scope($q))->orderBy('name')->get(['id', 'name', 'account_number']),
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
                'sort' => $request->sort,
                'per_page' => $perPage,
                'date_filter' => $request->date_filter,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'specific_date' => $request->specific_date,
            ],
        ]);
    }

    public function store(StoreAssetRequest $request, CreateAssetAction $action)
    {
        try {
            if ($request->boolean('is_new_purchase') && ! GlobalSetting::get('asset_purchase_category_id')) {
                return redirect()->back()->with('error', 'Set the Asset Purchase Expense Category in Global Settings before recording a new purchase.');
            }

            $action($request->validated());

            return redirect()->back()->with('success', 'Asset created successfully.');
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to create asset.');
        }
    }

    public function update(UpdateAssetRequest $request, Asset $asset)
    {
        $this->ensureAccessible($asset);

        try {
            $asset->update($request->validated());

            return redirect()->back()->with('success', 'Asset updated successfully.');
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to update asset.');
        }
    }

    public function destroy(Asset $asset)
    {
        $this->ensureAccessible($asset);

        try {
            $asset->delete();

            return redirect()->back()->with('success', 'Asset deleted successfully.');
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to delete asset.');
        }
    }
}
