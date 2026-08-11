<?php

namespace App\Actions\Products;

use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class DeleteProductAction
{
    public function __invoke(Product $product): void
    {
        DB::beginTransaction();

        try {
            if ($product->image && Storage::disk('public')->exists($product->image)) {
                Storage::disk('public')->delete($product->image);
            }

            $product->delete();

            DB::commit();
        } catch (\Throwable $th) {
            DB::rollBack();

            throw $th;
        }
    }
}
