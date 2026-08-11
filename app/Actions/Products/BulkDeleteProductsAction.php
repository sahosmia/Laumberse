<?php

namespace App\Actions\Products;

use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class BulkDeleteProductsAction
{
    /** @param int[] $ids Empty array deletes every product. */
    public function __invoke(array $ids = []): int
    {
        return DB::transaction(function () use ($ids) {
            $products = empty($ids) ? Product::all() : Product::whereIn('id', $ids)->get();

            foreach ($products as $product) {
                if ($product->image && Storage::disk('public')->exists($product->image)) {
                    Storage::disk('public')->delete($product->image);
                }
            }

            return Product::whereIn('id', $products->pluck('id'))->delete();
        });
    }
}
