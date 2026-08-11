<?php

namespace App\Actions\Assets;

use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\ManageAsset;
use Illuminate\Support\Facades\DB;

class CreateManageAssetAction
{
    public function __invoke(array $data): ManageAsset
    {
        return DB::transaction(function () use ($data) {
            $asset = ManageAsset::create($data);

            if (!empty($data['is_new_purchase'])) {
                $category = ExpenseCategory::firstOrCreate(
                    ['name' => 'Asset Purchase'],
                    ['description' => 'Expenses related to new asset purchases']
                );

                Expense::create([
                    'expense_category_id' => $category->id,
                    'manage_asset_id' => $asset->id,
                    'amount' => $asset->cost,
                    'payment_method' => $data['payment_method'],
                    'date' => $asset->purchase_date,
                    'description' => "Purchase of asset: {$asset->name}",
                ]);
            }

            return $asset;
        });
    }
}
