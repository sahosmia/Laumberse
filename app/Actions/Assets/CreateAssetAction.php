<?php

namespace App\Actions\Assets;

use App\Models\Asset;
use App\Models\GlobalSetting;
use App\Services\ExpenseService;
use App\Support\OutletContext;
use Illuminate\Support\Facades\DB;

class CreateAssetAction
{
    public function __construct(protected ExpenseService $expenseService) {}

    public function __invoke(array $data): Asset
    {
        return DB::transaction(function () use ($data) {
            $data['outlet_id'] = OutletContext::resolveForWrite($data['outlet_id'] ?? null);
            $asset = Asset::create($data);

            if (! empty($data['is_new_purchase'])) {
                $this->expenseService->storeExpense([
                    'outlet_id' => $asset->outlet_id,
                    'expense_category_id' => GlobalSetting::get('asset_purchase_category_id'),
                    'asset_id' => $asset->id,
                    'amount' => $asset->cost,
                    'account_id' => $data['account_id'],
                    'date' => $asset->purchase_date,
                    'description' => "Purchase of asset: {$asset->name}",
                ]);
            }

            return $asset;
        });
    }
}
