<?php

namespace App\Http\Controllers\Expenses;

use App\Exceptions\HasDependentRecordsException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Expenses\StoreExpenseCategoryRequest;
use App\Http\Requests\Expenses\UpdateExpenseCategoryRequest;
use App\Models\ExpenseCategory;
use App\Models\GlobalSetting;
use App\Support\PerPage;
use Illuminate\Http\Request;

class ExpenseCategoryController extends Controller
{
    /** value => [column, direction] — whitelisted so the raw `sort` query param never reaches orderBy(). */
    private const SORTABLE = [
        'created_at:desc' => ['created_at', 'desc'],
        'name:asc' => ['name', 'asc'],
        'name:desc' => ['name', 'desc'],
    ];

    /** GlobalSetting keys that store an expense_categories.id — deleting a category assigned to one of these breaks that setting. */
    private const CATEGORY_SETTING_LABELS = [
        'salary_category_id' => 'the Salary Expense Category setting',
        'material_expense_category_id' => 'the Material Expense Category setting',
        'asset_purchase_category_id' => 'the Asset Purchase Category setting',
        'business_transportation_category_id' => 'the Business Transportation Category setting',
        'delivery_transportation_category_id' => 'the Delivery Transportation Category setting',
    ];

    public function index(Request $request)
    {
        [$sortColumn, $sortDirection] = self::SORTABLE[$request->sort] ?? self::SORTABLE['created_at:desc'];
        $perPage = PerPage::resolve($request);

        $categories = ExpenseCategory::when($request->search, fn ($q, $s) => $q->where(function ($q) use ($s) {
            $q->where('name', 'like', "%{$s}%")->orWhere('description', 'like', "%{$s}%");
        }))
            ->orderBy($sortColumn, $sortDirection)
            ->orderBy('id', $sortDirection)
            ->paginate($perPage)
            ->withQueryString();
        $filters = [
            'search' => $request->search,
            'sort' => $request->sort,
            'per_page' => $perPage,
        ];

        return inertia('expenses/categories/index', compact('categories', 'filters'));
    }

    public function store(StoreExpenseCategoryRequest $request)
    {
        try {
            ExpenseCategory::create($request->validated());

            return redirect()->back()->with('success', 'Category created successfully.');
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to create category.');
        }
    }

    public function update(UpdateExpenseCategoryRequest $request, ExpenseCategory $expenseCategory)
    {
        try {
            $expenseCategory->update($request->validated());

            return redirect()->back()->with('success', 'Category updated successfully.');
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to update category.');
        }
    }

    public function destroy(ExpenseCategory $expenseCategory)
    {
        try {
            if ($expenseCategory->expenses()->exists()) {
                throw new HasDependentRecordsException($expenseCategory->name, 'expenses recorded against it');
            }

            $assignedSettingKey = GlobalSetting::whereIn('key', array_keys(self::CATEGORY_SETTING_LABELS))
                ->where('value', (string) $expenseCategory->id)
                ->value('key');

            if ($assignedSettingKey) {
                return redirect()->back()->with(
                    'error',
                    "Cannot delete {$expenseCategory->name} — it's currently assigned to ".self::CATEGORY_SETTING_LABELS[$assignedSettingKey].'. Change that setting first.'
                );
            }

            $expenseCategory->delete();

            return redirect()->back()->with('success', 'Category deleted successfully.');
        } catch (HasDependentRecordsException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to delete category.');
        }
    }
}
