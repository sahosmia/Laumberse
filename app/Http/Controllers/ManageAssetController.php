<?php

namespace App\Http\Controllers;

use App\Actions\Assets\CreateManageAssetAction;
use App\Http\Requests\ManageAssets\StoreManageAssetRequest;
use App\Http\Requests\ManageAssets\UpdateManageAssetRequest;
use App\Models\AssetCategory;
use App\Models\ManageAsset;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ManageAssetController extends Controller
{
    public function index(Request $request)
    {
        $manageAssets = ManageAsset::with('category')
            ->when($request->search, fn($q, $s) => $q->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                    ->orWhere('description', 'like', "%{$s}%")
                    ->orWhereHas('category', fn($q) => $q->where('name', 'like', "%{$s}%"));
            }))
            ->latest()
            ->paginate(50)
            ->withQueryString();

        return Inertia::render('manage-assets/index', [
            'manageAssets' => $manageAssets,
            'categories' => AssetCategory::orderBy('name')->get(),
            'filters' => ['search' => $request->search],
        ]);
    }

    public function store(StoreManageAssetRequest $request, CreateManageAssetAction $action)
    {
        $action($request->validated());

        return redirect()->back()->with('success', 'ManageAsset created successfully.');
    }

    public function update(UpdateManageAssetRequest $request, ManageAsset $manage_asset)
    {
        $manage_asset->update($request->validated());
        return redirect()->back()->with('success', 'ManageAsset updated successfully.');
    }

    public function destroy(ManageAsset $manage_asset)
    {
        $manage_asset->delete();
        return redirect()->back()->with('success', 'ManageAsset deleted successfully.');
    }
}
