<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAssetCategoryRequest;
use App\Http\Requests\UpdateAssetCategoryRequest;
use App\Models\AssetCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AssetCategoryController extends Controller
{
    public function index(Request $request)
    {
        $categories = AssetCategory::when($request->search, fn($q, $s) => $q->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")->orWhere('description', 'like', "%{$s}%");
            }))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('manage-assets/categories/index', [
            'categories' => $categories,
            'filters' => ['search' => $request->search],
        ]);
    }

    public function store(StoreAssetCategoryRequest $request)
    {
        AssetCategory::create($request->validated());
        return redirect()->back()->with('success', 'Asset Category created successfully.');
    }

    public function update(UpdateAssetCategoryRequest $request, AssetCategory $assetCategory)
    {
        $assetCategory->update($request->validated());
        return redirect()->back()->with('success', 'Asset Category updated successfully.');
    }

    public function destroy(AssetCategory $assetCategory)
    {
        $assetCategory->delete();
        return redirect()->back()->with('success', 'Asset Category deleted successfully.');
    }
}
