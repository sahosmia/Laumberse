<?php

namespace App\Http\Controllers\Products;

use App\Actions\Products\CreateProductAction;
use App\Actions\Products\DeleteProductAction;
use App\Actions\Products\UpdateProductAction;
use App\Exceptions\HasDependentRecordsException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Products\StoreProductRequest;
use App\Http\Requests\Products\UpdateProductRequest;
use App\Models\Category;
use App\Models\Outlet;
use App\Models\Product;
use App\Support\PerPage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /** value => [column, direction] — whitelisted so the raw `sort` query param never reaches orderBy(). */
    private const SORTABLE = [
        'created_at:desc' => ['created_at', 'desc'],
        'name:asc' => ['name', 'asc'],
        'name:desc' => ['name', 'desc'],
        'price:desc' => ['price', 'desc'],
        'price:asc' => ['price', 'asc'],
    ];

    public function index(Request $request): Response
    {
        [$sortColumn, $sortDirection] = self::SORTABLE[$request->sort] ?? self::SORTABLE['created_at:desc'];
        $perPage = PerPage::resolve($request);

        $products = Product::query()
            ->with([
                'category:id,name',
                'outletPrices',
            ])
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->when($request->category_id, fn ($q, $id) => $q->where('category_id', $id))
            ->orderBy($sortColumn, $sortDirection)
            ->orderBy('id', $sortDirection)
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('products/index', [
            'products' => $products,
            'categories' => Category::query()
                ->select('id', 'name')
                ->get(),
            'outlets' => Outlet::active()->orderBy('name')->get(['id', 'name']),
            'filters' => [
                'search' => $request->search,
                'category_id' => $request->category_id,
                'sort' => $request->sort,
                'per_page' => $perPage,
            ],
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
        } catch (HasDependentRecordsException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        } catch (\Throwable) {
            return redirect()->back()->with('error', 'Failed to delete product.');
        }
    }
}
