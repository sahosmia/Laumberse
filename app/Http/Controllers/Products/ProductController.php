<?php

namespace App\Http\Controllers\Products;

use App\Actions\Products\BulkDeleteProductsAction;
use App\Actions\Products\CreateProductAction;
use App\Actions\Products\DeleteProductAction;
use App\Actions\Products\UpdateProductAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Products\StoreProductRequest;
use App\Http\Requests\Products\UpdateProductRequest;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $products = Product::query()
            ->with([
                'category:id,name',
            ])
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->latest()
            ->paginate(50)
            ->withQueryString();

        return Inertia::render('products/index', [
            'products' => $products,
            'categories' => Category::query()
                ->select('id', 'name')
                ->get(),
            'filters' => ['search' => $request->search],
        ]);
    }

    public function store(StoreProductRequest $request, CreateProductAction $action): RedirectResponse
    {
        try {
            $action($request->validated());

            return redirect()->back()->with('success', 'Product created successfully.');
        } catch (\Throwable) {
            return redirect()->back()->with('error', 'Failed to create product.');
        }
    }

    public function update(UpdateProductRequest $request, Product $product, UpdateProductAction $action): RedirectResponse
    {
        try {
            $action($product, $request->validated());

            return redirect()->back()->with('success', 'Product updated successfully.');
        } catch (\Throwable) {
            return redirect()->back()->with('error', 'Failed to update product.');
        }
    }

    public function destroy(Product $product, DeleteProductAction $action): RedirectResponse
    {
        try {
            $action($product);

            return redirect()->back()->with('success', 'Product deleted successfully.');
        } catch (\Throwable) {
            return redirect()->back()->with('error', 'Failed to delete product.');
        }
    }

    public function bulkDestroy(Request $request, BulkDeleteProductsAction $action): RedirectResponse
    {
        $ids = $request->input('ids', []);

        try {
            $action($ids);

            return redirect()
                ->back()
                ->with('success', empty($ids) ? 'All products deleted successfully.' : 'Selected products deleted successfully.');
        } catch (\Throwable) {
            return redirect()->back()->with('error', 'Failed to delete products.');
        }
    }
}
