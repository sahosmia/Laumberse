<?php

namespace App\Actions\Products;

use App\Models\Product;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class UpdateProductAction
{
    public function __invoke(Product $product, array $data): Product
    {
        DB::beginTransaction();

        try {
            if (isset($data['image']) && $data['image'] instanceof UploadedFile) {
                if ($product->image && Storage::disk('public')->exists($product->image)) {
                    Storage::disk('public')->delete($product->image);
                }

                $data['image'] = $data['image']->store('products', 'public');
            } else {
                unset($data['image']);
            }

            $product->update($data);

            DB::commit();

            return $product;
        } catch (\Throwable $th) {
            DB::rollBack();

            throw $th;
        }
    }
}
