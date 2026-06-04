<?php

namespace App\Http\Controllers;

use App\Http\Requests\Assets\StoreAssetRequest;
use App\Http\Requests\Assets\UpdateAssetRequest;
use App\Models\Asset;
use Inertia\Inertia;

class AssetController extends Controller
{
    public function index()
    {
        return Inertia::render('assets/index', [
            'assets' => Asset::orderBy('purchase_date', 'desc')->get(),
        ]);
    }

    public function store(StoreAssetRequest $request)
    {
        Asset::create($request->validated());
        return redirect()->back()->with('success', 'Asset created successfully.');
    }

    public function update(UpdateAssetRequest $request, Asset $asset)
    {
        $asset->update($request->validated());
        return redirect()->back()->with('success', 'Asset updated successfully.');
    }

    public function destroy(Asset $asset)
    {
        $asset->delete();
        return redirect()->back()->with('success', 'Asset deleted successfully.');
    }
}
