<?php

namespace App\Actions\Products;

use App\Exceptions\HasDependentRecordsException;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class DeleteProductAction
{
    public function __invoke(Product $product): void
    {
        if ($product->invoiceItems()->exists()) {
            throw new HasDependentRecordsException($product->name, 'past invoices that include it');
        }

        DB::transaction(function () use ($product) {
            if ($product->image && Storage::disk('public')->exists($product->image)) {
                Storage::disk('public')->delete($product->image);
            }

            $product->delete();
        });
    }
}
