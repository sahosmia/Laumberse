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
        // The file store happens before the DB transaction, not inside it: a SQL transaction never
        // covers filesystem writes anyway (rolling back the DB can't un-store a file), so the
        // original beginTransaction()/commit() boundary never actually protected this step — only
        // Product::create() needed atomicity. The try/catch below is the real safety net: if the
        // insert fails after the file was already stored (e.g. the unique name constraint), the
        // orphaned file it produced is deleted before the exception propagates.
        if (isset($data['image']) && $data['image'] instanceof UploadedFile) {
            $data['image'] = $data['image']->store('products', 'public');
        }

        try {
            return DB::transaction(function () use ($data) {
                $product = Product::create($data);

                foreach ($data['outlet_prices'] ?? [] as $row) {
                    $product->outletPrices()->create($row);
                }

                return $product;
            });
        } catch (\Throwable $th) {
            if (! empty($data['image']) && is_string($data['image'])) {
                Storage::disk('public')->delete($data['image']);
            }

            throw $th;
        }
    }
}
