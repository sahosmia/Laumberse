<?php

namespace App\Http\Controllers;

use App\Http\Requests\ManageAssets\StoreManageAssetRequest;
use App\Http\Requests\ManageAssets\UpdateManageAssetRequest;
use App\Models\AssetCategory;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\ManageAsset;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ManageAssetController extends Controller
{
    public function index()
    {
        return Inertia::render('manage-assets/index', [
            'manageAssets' => ManageAsset::with('category')->orderBy('purchase_date', 'desc')->get(),
            'categories' => AssetCategory::orderBy('name')->get(),
        ]);
    }

    public function store(StoreManageAssetRequest $request)
    {
        DB::transaction(function () use ($request) {
            $asset = ManageAsset::create($request->validated());

            if ($request->is_new_purchase) {
                $category = ExpenseCategory::firstOrCreate(
                    ['name' => 'Asset Purchase'],
                    ['description' => 'Expenses related to new asset purchases']
                );

                Expense::create([
                    'expense_category_id' => $category->id,
                    'manage_asset_id' => $asset->id,
                    'amount' => $asset->cost,
                    'payment_method' => $request->payment_method,
                    'date' => $asset->purchase_date,
                    'description' => "Purchase of asset: {$asset->name}",
                ]);
            }
        });

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
