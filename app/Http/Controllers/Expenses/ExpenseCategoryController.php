<?php

namespace App\Http\Controllers\Expenses;

use App\Http\Controllers\Controller;
use App\Http\Requests\Expenses\StoreExpenseCategoryRequest;
use App\Http\Requests\Expenses\UpdateExpenseCategoryRequest;
use App\Models\ExpenseCategory;
use Illuminate\Http\Request;

class ExpenseCategoryController extends Controller
{
    public function index(Request $request)
    {
        $categories = ExpenseCategory::when($request->search, fn($q, $s) => $q->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")->orWhere('description', 'like', "%{$s}%");
            }))
            ->latest()
            ->paginate(50)
            ->withQueryString();
        $filters = ['search' => $request->search];

        return inertia('expenses/categories/index', compact('categories', 'filters'));
    }
    public function store(StoreExpenseCategoryRequest $request)
    {
        ExpenseCategory::create($request->validated());
        return redirect()->back()->with('success', 'Category created successfully.');
    }

    public function update(UpdateExpenseCategoryRequest $request, ExpenseCategory $expenseCategory)
    {
        $expenseCategory->update($request->validated());
        return redirect()->back()->with('success', 'Category updated successfully.');
    }

    public function destroy(ExpenseCategory $expenseCategory)
    {
        $expenseCategory->delete();
        return redirect()->back()->with('success', 'Category deleted successfully.');
    }
}
