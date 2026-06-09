<?php

namespace App\Http\Controllers;

use App\Http\Requests\ManageAssets\StoreManageAssetRequest;
use App\Http\Requests\ManageAssets\UpdateManageAssetRequest;
use App\Models\ManageAsset;
use Inertia\Inertia;

class ManageAssetController extends Controller
{
    public function index()
    {
        return Inertia::render('manage-assets/index', [
            'manageAssets' => ManageAsset::orderBy('purchase_date', 'desc')->get(),
        ]);
    }

    public function store(StoreManageAssetRequest $request)
    {
        ManageAsset::create($request->validated());
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
