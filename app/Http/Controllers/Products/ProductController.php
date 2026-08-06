<?php

namespace App\Http\Controllers\Products;

use App\Http\Controllers\Controller;
use App\Http\Requests\Products\StoreProductRequest;
use App\Http\Requests\Products\UpdateProductRequest;
use App\Models\Category;
use App\Models\Product;
use App\Models\Unit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(): Response
    {
        $products = Product::query()
            ->with([
                'category:id,name',
                'unit:id,name',
            ])
            ->latest()
            ->get();

        return Inertia::render('products/index', [
            'products' => $products,
            'categories' => Category::query()
                ->select('id', 'name')
                ->get(),

            'units' => Unit::query()
                ->select('id', 'name')
                ->get(),
        ]);
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        DB::beginTransaction();

        try {
            $data = $request->validated();

            // Upload Image
            if ($request->hasFile('image')) {
                $data['image'] = $request->file('image')->store('products', 'public');
            }

            // Create Product
            $product = Product::create($data);

            DB::commit();

            return redirect()
                ->back()
                ->with('success', 'Product created successfully.');
        } catch (\Throwable $th) {
            DB::rollBack();

            // Delete uploaded image if transaction fails
            if (!empty($data['image'])) {
                Storage::disk('public')->delete($data['image']);
            }

            return redirect()
                ->back()
                ->with('error', 'Failed to create product.');
        }
    }

    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        DB::beginTransaction();

        try {
            $data = $request->validated();

            // Upload New Image
            if ($request->hasFile('image')) {

                // Delete old image
                if ($product->image && Storage::disk('public')->exists($product->image)) {
                    Storage::disk('public')->delete($product->image);
                }

                $data['image'] = $request->file('image')->store('products', 'public');
            } else {
                unset($data['image']);
            }

            // Update Product
            $product->update($data);

            DB::commit();

            return redirect()
                ->back()
                ->with('success', 'Product updated successfully.');
        } catch (\Throwable $th) {
            DB::rollBack();

            return redirect()
                ->back()
                ->with('error', 'Failed to update product.');
        }
    }

    public function destroy(Product $product): RedirectResponse
    {
        DB::beginTransaction();

        try {

            // Delete Image
            if ($product->image && Storage::disk('public')->exists($product->image)) {
                Storage::disk('public')->delete($product->image);
            }

            // Delete Product
            $product->delete();

            DB::commit();

            return redirect()
                ->back()
                ->with('success', 'Product deleted successfully.');
        } catch (\Throwable $th) {
            DB::rollBack();

            return redirect()
                ->back()
                ->with('error', 'Failed to delete product.');
        }
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $ids = $request->input('ids', []);

        DB::beginTransaction();

        try {

            // Delete All Products
            if (empty($ids)) {

                $products = Product::all();

                foreach ($products as $product) {

                    if ($product->image && Storage::disk('public')->exists($product->image)) {
                        Storage::disk('public')->delete($product->image);
                    }
                }

                Product::query()->delete();

                DB::commit();

                return redirect()
                    ->back()
                    ->with('success', 'All products deleted successfully.');
            }

            // Delete Selected Products
            $products = Product::whereIn('id', $ids)->get();

            foreach ($products as $product) {

                if ($product->image && Storage::disk('public')->exists($product->image)) {
                    Storage::disk('public')->delete($product->image);
                }
            }

            Product::whereIn('id', $ids)->delete();

            DB::commit();

            return redirect()
                ->back()
                ->with('success', 'Selected products deleted successfully.');

        } catch (\Throwable $th) {

            DB::rollBack();

            return redirect()
                ->back()
                ->with('error', 'Failed to delete products.');
        }
    }
}
