<?php

namespace App\Http\Controllers\Expenses;

use App\Exceptions\InsufficientBalanceException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Expenses\StoreExpenseRequest;
use App\Http\Requests\Expenses\UpdateExpenseRequest;
use App\Models\Account;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\GlobalSetting;
use App\Models\Material;
use App\Services\ExpenseService;
use App\Support\DateRangeFilter;
use App\Support\OutletContext;
use App\Support\PerPage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ExpenseController extends Controller
{
    /** value => [column, direction] — whitelisted so the raw `sort` query param never reaches orderBy(). */
    private const SORTABLE = [
        'created_at:desc' => ['created_at', 'desc'],
        'date:desc' => ['date', 'desc'],
        'date:asc' => ['date', 'asc'],
        'amount:desc' => ['amount', 'desc'],
        'amount:asc' => ['amount', 'asc'],
    ];

    /** Every action that receives a route-bound Expense must call this first — see InvoiceController::ensureAccessible(). */
    private function ensureAccessible(Expense $expense): void
    {
        if (! OutletContext::canAccess($expense->outlet_id)) {
            throw new NotFoundHttpException;
        }
    }

    public function index(Request $request)
    {
        [$sortColumn, $sortDirection] = self::SORTABLE[$request->sort] ?? self::SORTABLE['created_at:desc'];
        $perPage = PerPage::resolve($request);

        $expenses = Expense::with(['category', 'account', 'materials.material.unit', 'payroll.employee'])
            ->tap(fn ($q) => OutletContext::scope($q))
            ->when($request->search, fn ($q, $s) => $q->where(function ($q) use ($s) {
                $q->where('description', 'like', "%{$s}%")
                    ->orWhereHas('category', fn ($q) => $q->where('name', 'like', "%{$s}%"));
            }))
            ->when($request->category_id, fn ($q, $categoryId) => $q->where('expense_category_id', $categoryId))
            ->tap(fn ($q) => DateRangeFilter::apply($q, $request))
            ->orderBy($sortColumn, $sortDirection)
            ->orderBy('id', $sortDirection)
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('expenses/index', [
            'expenses' => $expenses,
            'categories' => ExpenseCategory::ordered()->get(['id', 'name']),
            'accounts' => Account::tap(fn ($q) => OutletContext::scope($q))->orderBy('name')->get(['id', 'name', 'account_number']),
            'salary_category_id' => GlobalSetting::get('salary_category_id'),
            'materials' => Material::with('unit')->orderBy('name')->get(),
            'filters' => [
                'search' => $request->search,
                'category_id' => $request->category_id,
                'date_filter' => $request->date_filter,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'specific_date' => $request->specific_date,
                'sort' => $request->sort,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(StoreExpenseRequest $request, ExpenseService $expenseService)
    {
        try {
            $expenseService->storeExpense($request->validated());

            return redirect()->back()->with('success', 'Expense created successfully.');
        } catch (InsufficientBalanceException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to create expense.');
        }
    }

    public function update(UpdateExpenseRequest $request, Expense $expense, ExpenseService $expenseService)
    {
        $this->ensureAccessible($expense);

        try {
            $expenseService->updateExpense($expense, $request->validated());

            return redirect()->back()->with('success', 'Expense updated successfully.');
        } catch (InsufficientBalanceException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to update expense.');
        }
    }

    public function show(Expense $expense)
    {
        $this->ensureAccessible($expense);

        return Inertia::render('expenses/show', [
            'expense' => $expense->load(['category', 'account', 'materials.material.unit', 'payroll.employee', 'asset.category']),
        ]);
    }

    public function destroy(Expense $expense, ExpenseService $expenseService)
    {
        $this->ensureAccessible($expense);

        try {
            $expenseService->deleteExpense($expense);

            return redirect()->back()->with('success', 'Expense deleted successfully.');
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to delete expense.');
        }
    }
}
