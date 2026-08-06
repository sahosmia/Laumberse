<?php

namespace App\Http\Controllers\Expenses;

use App\Http\Controllers\Controller;
use App\Http\Requests\Expenses\StoreExpenseRequest;
use App\Http\Requests\Expenses\UpdateExpenseRequest;
use App\Models\Expense;
use App\Models\Material;
use App\Models\ExpenseCategory;
use App\Models\GlobalSetting;
use App\Services\ExpenseService;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    public function index()
    {
        return Inertia::render('expenses/index', [
            'expenses' => Expense::with(['category', 'materials.material.unit', 'payroll'])->orderBy('date', 'desc')->get(),
            'categories' => ExpenseCategory::all(),
            'salary_category_id' => GlobalSetting::get('salary_category_id'),
            'materials' => Material::with('unit')->orderBy('name')->get()
        ]);
    }

    public function store(StoreExpenseRequest $request, ExpenseService $expenseService)
    {
        $expenseService->storeExpense($request->validated());
        return redirect()->back()->with('success', 'Expense created successfully.');
    }

    public function update(UpdateExpenseRequest $request, Expense $expense, ExpenseService $expenseService)
    {
        $expenseService->updateExpense($expense, $request->validated());
        return redirect()->back()->with('success', 'Expense updated successfully.');
    }

    public function show(Expense $expense)
    {
        return Inertia::render('expenses/show', [
            'expense' => $expense->load(['category', 'materials.material.unit', 'payroll.employee', 'asset.category'])
        ]);
    }

    public function destroy(Expense $expense)
    {
        $expense->delete();
        return redirect()->back()->with('success', 'Expense deleted successfully.');
    }
}
