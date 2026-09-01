<?php

namespace App\Http\Controllers\Assets;

use App\Http\Controllers\Controller;
use App\Http\Requests\Assets\StoreAssetCategoryRequest;
use App\Http\Requests\Assets\UpdateAssetCategoryRequest;
use App\Models\AssetCategory;
use App\Support\PerPage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AssetCategoryController extends Controller
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

        $categories = AssetCategory::when($request->search, fn ($q, $s) => $q->where(function ($q) use ($s) {
            $q->where('name', 'like', "%{$s}%")->orWhere('description', 'like', "%{$s}%");
        }))
            ->orderBy($sortColumn, $sortDirection)
            ->orderBy('id', $sortDirection)
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('assets/categories/index', [
            'categories' => $categories,
            'filters' => [
                'search' => $request->search,
                'sort' => $request->sort,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(StoreAssetCategoryRequest $request)
    {
        try {
            AssetCategory::create($request->validated());

            return redirect()->back()->with('success', 'Asset Category created successfully.');
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to create asset category.');
        }
    }

    public function update(UpdateAssetCategoryRequest $request, AssetCategory $assetCategory)
    {
        try {
            $assetCategory->update($request->validated());

            return redirect()->back()->with('success', 'Asset Category updated successfully.');
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to update asset category.');
        }
    }

    public function destroy(AssetCategory $assetCategory)
    {
        try {
            $assetCategory->delete();

            return redirect()->back()->with('success', 'Asset Category deleted successfully.');
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to delete asset category.');
        }
    }
}
