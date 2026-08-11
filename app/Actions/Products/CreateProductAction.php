<?php

namespace App\Actions\Products;

use App\Models\Product;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class CreateProductAction
{
    public function __invoke(array $data): Product
    {
        DB::beginTransaction();

        try {
            if (isset($data['image']) && $data['image'] instanceof UploadedFile) {
                $data['image'] = $data['image']->store('products', 'public');
            }

            $product = Product::create($data);

            DB::commit();

            return $product;
        } catch (\Throwable $th) {
            DB::rollBack();

            if (!empty($data['image']) && is_string($data['image'])) {
                Storage::disk('public')->delete($data['image']);
            }

            throw $th;
        }
    }
}
