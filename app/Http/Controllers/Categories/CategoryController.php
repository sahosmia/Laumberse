<?php

namespace App\Http\Controllers\Categories;

use App\Exceptions\HasDependentRecordsException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Categories\StoreCategoryRequest;
use App\Http\Requests\Categories\UpdateCategoryRequest;
use App\Models\Category;
use App\Support\PerPage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    /** value => [column, direction] — whitelisted so the raw `sort` query param never reaches orderBy(). */
    private const SORTABLE = [
        'created_at:desc' => ['created_at', 'desc'],
        'name:asc' => ['name', 'asc'],
        'name:desc' => ['name', 'desc'],
    ];

    public function index(Request $request)
    {
        [$sortColumn, $sortDirection] = self::SORTABLE[$request->sort] ?? self::SORTABLE['created_at:desc'];
        $perPage = PerPage::resolve($request);

        $categories = Category::when($request->search, fn ($q, $s) => $q->where(function ($q) use ($s) {
            $q->where('name', 'like', "%{$s}%")->orWhere('description', 'like', "%{$s}%");
        }))
            ->orderBy($sortColumn, $sortDirection)
            ->orderBy('id', $sortDirection)
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('categories/index', [
            'categories' => $categories,
            'filters' => [
                'search' => $request->search,
                'sort' => $request->sort,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(StoreCategoryRequest $request)
    {
        try {
            Category::create($request->validated());

            return redirect()->route('categories.index')->with('success', 'Category created successfully.');
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to create category.');
        }
    }

    public function update(UpdateCategoryRequest $request, Category $category)
    {
        try {
            $category->update($request->validated());

            return redirect()->route('categories.index')->with('success', 'Category updated successfully.');
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to update category.');
        }
    }

    public function destroy(Category $category)
    {
        try {
            if ($category->products()->exists()) {
                throw new HasDependentRecordsException($category->name, 'products assigned to it');
            }

            $category->delete();

            return redirect()->route('categories.index')->with('success', 'Category deleted successfully.');
        } catch (HasDependentRecordsException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to delete category.');
        }
    }
}
