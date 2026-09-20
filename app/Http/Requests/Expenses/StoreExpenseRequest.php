<?php

namespace App\Http\Requests\Expenses;

use App\Enums\AssetStatus;
use App\Enums\ExpenseType;
use App\Models\Expense;
use App\Support\OutletContext;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $categoryId = $this->input('expense_category_id') !== null ? (int) $this->input('expense_category_id') : null;
        $type = Expense::classifyType($categoryId);

        $isPayroll = $type === ExpenseType::Salary;
        $isMaterial = $type === ExpenseType::Material;
        $isAsset = $type === ExpenseType::Asset;

        return [
            // Only meaningful for a switch-capable user currently viewing "All Outlets" — see
            // App\Support\OutletContext::resolveForWrite.
            'outlet_id' => [
                Rule::requiredIf(fn () => OutletContext::isAll()),
                'nullable',
                Rule::exists('outlets', 'id')->where('status', 'active'),
            ],
            'expense_category_id' => 'required|exists:expense_categories,id',
            // The account must belong to the same outlet this expense is being written to —
            // otherwise the expense and the money it actually moved end up attributed to two
            // different outlets' books (see OutletContext::resolvableForWrite).
            'account_id' => [
                'required',
                Rule::exists('accounts', 'id')->where(
                    fn ($q) => $q->where('outlet_id', OutletContext::resolvableForWrite($this->input('outlet_id')) ?? -1)
                ),
            ],
            'amount' => 'required|numeric|gt:0',
            'date' => 'required|date',
            'description' => 'nullable|string|max:500',

            // Material specific fields
            'items' => $isMaterial ? 'required|array|min:1' : 'nullable|array',
            'items.*.material_id' => $isMaterial ? 'required|exists:materials,id' : 'nullable',
            'items.*.quantity' => $isMaterial ? 'required|numeric|min:0.01' : 'nullable',
            'items.*.unit_price' => $isMaterial ? 'required|numeric|gt:0' : 'nullable',

            // Payroll specific fields
            'employee_id' => $isPayroll ? 'required|exists:employees,id' : 'nullable',
            'month' => $isPayroll ? 'required|integer|between:1,12' : 'nullable',
            'year' => $isPayroll ? 'required|integer' : 'nullable',
            'bonus' => $isPayroll ? 'nullable|numeric|min:0' : 'nullable',
            'deduction' => $isPayroll ? 'nullable|numeric|min:0' : 'nullable',
            'deduction_note' => ($isPayroll && $this->input('deduction') > 0) ? 'required|string' : 'nullable|string',

            // Asset purchase specific fields — `amount`/`date`/`description` above double as the
            // new Asset's cost/purchase_date/description (see ExpenseService::storeExpense).
            'asset_name' => $isAsset ? 'required|string|max:255' : 'nullable|string|max:255',
            'asset_category_id' => $isAsset ? 'required|exists:asset_categories,id' : 'nullable|exists:asset_categories,id',
            'asset_status' => $isAsset ? ['required', Rule::enum(AssetStatus::class)] : 'nullable',
        ];
    }
}
