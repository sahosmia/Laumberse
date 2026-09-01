<?php

namespace App\Http\Controllers\Employees;

use App\Actions\Employees\GetEligibleEmployeesForPayrollAction;
use App\Exceptions\HasDependentRecordsException;
use App\Exceptions\InsufficientBalanceException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Employees\GetEligibleForPayrollRequest;
use App\Http\Requests\Employees\StoreEmployeePayrollRequest;
use App\Http\Requests\Employees\StoreEmployeeRequest;
use App\Http\Requests\Employees\UpdateEmployeeRequest;
use App\Models\Account;
use App\Models\Employee;
use App\Models\GlobalSetting;
use App\Services\ExpenseService;
use App\Support\LedgerQuery;
use App\Support\OutletContext;
use App\Support\PerPage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class EmployeeController extends Controller
{
    /** value => [column, direction] — whitelisted so the raw `sort` query param never reaches orderBy(). */
    private const SORTABLE = [
        'created_at:desc' => ['created_at', 'desc'],
        'name:asc' => ['name', 'asc'],
        'name:desc' => ['name', 'desc'],
        'base_salary:desc' => ['base_salary', 'desc'],
        'base_salary:asc' => ['base_salary', 'asc'],
    ];

    /** Every action that receives a route-bound Employee must call this first — see InvoiceController::ensureAccessible(). */
    private function ensureAccessible(Employee $employee): void
    {
        if (! OutletContext::canAccess($employee->outlet_id)) {
            throw new NotFoundHttpException;
        }
    }

    public function index(Request $request)
    {
        [$sortColumn, $sortDirection] = self::SORTABLE[$request->sort] ?? self::SORTABLE['created_at:desc'];
        $perPage = PerPage::resolve($request);

        $employees = Employee::tap(fn ($q) => OutletContext::scope($q))
            ->when($request->search, fn ($q, $s) => $q->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")->orWhere('designation', 'like', "%{$s}%");
            }))
            ->when($request->status, fn ($q, $status) => $q->where('is_active', $status === 'active'))
            ->orderBy($sortColumn, $sortDirection)
            ->orderBy('id', $sortDirection)
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('employees/index', [
            'employees' => $employees,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
                'sort' => $request->sort,
                'per_page' => $perPage,
            ],
            'summary' => [
                'total_staff' => Employee::tap(fn ($q) => OutletContext::scope($q))->count(),
                'active_staff' => Employee::tap(fn ($q) => OutletContext::scope($q))->active()->count(),
                'pending_advances' => (float) Employee::tap(fn ($q) => OutletContext::scope($q))->where('current_balance', '>', 0)->sum('current_balance'),
            ],
        ]);
    }

    public function store(StoreEmployeeRequest $request)
    {
        try {
            $data = $request->validated();
            $data['outlet_id'] = OutletContext::resolveForWrite($data['outlet_id'] ?? null);

            Employee::create($data);

            return redirect()->back()->with('success', 'Employee added successfully.');
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to add employee.');
        }
    }

    public function show(Request $request, Employee $employee)
    {
        $this->ensureAccessible($employee);

        // The employee ledger merges two sources that used to live on separate pages — advance/
        // loan/loan_return (employee_transactions) and salary payments (expenses of type 'salary',
        // joined back to the payroll they belong to) — into one timeline, oldest-known-balance
        // first. Salary payments don't move `current_balance` (only advance/loan/loan_return do),
        // so they carry the running balance forward unchanged rather than adding to it.
        //
        // Opening balance has no row of its own in either source, so the running total starts from
        // opening_balance itself. The window function must run over ALL of this employee's history
        // regardless of the date filter (see AccountController::show for why), so it runs in a
        // subquery first with the date filter applied outside it.
        $transactionsQuery = DB::table('employee_transactions')
            ->where('employee_id', $employee->id)
            ->selectRaw("id, date, created_at, 'transaction' as source, transaction_type as type, note, account_id, amount");

        $salaryQuery = DB::table('expenses')
            ->join('payrolls', 'payrolls.id', '=', 'expenses.payroll_id')
            ->where('payrolls.employee_id', $employee->id)
            ->where('expenses.type', 'salary')
            ->selectRaw(
                "expenses.id, expenses.date, expenses.created_at, 'salary' as source, 'salary' as type, "
                ."COALESCE(NULLIF(payrolls.note, ''), expenses.description) as note, expenses.account_id, expenses.amount"
            );

        $withRunningBalance = DB::query()->fromSub($transactionsQuery->unionAll($salaryQuery), 'ledger')
            ->leftJoin('accounts', 'accounts.id', '=', 'ledger.account_id')
            ->selectRaw(
                'ledger.*, accounts.name as account_name, accounts.account_number as account_number, '
                ."? + SUM(CASE WHEN ledger.source = 'salary' THEN 0 WHEN ledger.type = 'loan_return' THEN -ledger.amount ELSE ledger.amount END) "
                .'OVER (ORDER BY ledger.date ASC, ledger.created_at ASC, ledger.id ASC) AS running_balance',
                [$employee->opening_balance],
            );

        $transactions = LedgerQuery::paginate(
            $withRunningBalance,
            'ledger_with_balance',
            $request,
            orderByDesc: ['date', 'created_at', 'id'],
            perPage: 10,
        );

        return Inertia::render('employees/show', [
            'employee' => $employee,
            'transactions' => $transactions,
            'accounts' => Account::tap(fn ($q) => OutletContext::scope($q))->orderBy('name')->get(['id', 'name', 'account_number']),
            'filters' => [
                'date_filter' => $request->date_filter,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'specific_date' => $request->specific_date,
            ],
        ]);
    }

    public function storePayroll(StoreEmployeePayrollRequest $request, Employee $employee, ExpenseService $expenseService)
    {
        $this->ensureAccessible($employee);

        try {
            $salaryCategoryId = GlobalSetting::get('salary_category_id');

            if (! $salaryCategoryId) {
                return redirect()->back()->with('error', 'Set the Salary Expense Category in Global Settings before paying salary.');
            }

            $data = $request->validated();
            $data['expense_category_id'] = $salaryCategoryId;
            $data['employee_id'] = $employee->id;
            $data['amount'] = round($employee->base_salary + ($data['bonus'] ?? 0) - ($data['deduction'] ?? 0), 2);
            $data['description'] = "Salary - {$employee->name}";

            $expenseService->storeExpense($data);

            return redirect()->back()->with('success', 'Salary payment recorded successfully.');
        } catch (InsufficientBalanceException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to record salary payment.');
        }
    }

    public function update(UpdateEmployeeRequest $request, Employee $employee)
    {
        $this->ensureAccessible($employee);

        try {
            $data = $request->validated();
            $data['employee_id'] = ($data['employee_id'] ?? null) ?: $employee->employee_id;

            $employee->update($data);

            return redirect()->back()->with('success', 'Employee updated successfully.');
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to update employee.');
        }
    }

    public function destroy(Employee $employee)
    {
        $this->ensureAccessible($employee);

        try {
            if ($employee->payrolls()->exists() || $employee->transactions()->exists()) {
                throw new HasDependentRecordsException($employee->name, 'payroll or advance/loan history');
            }

            $employee->delete();

            return redirect()->back()->with('success', 'Employee deleted successfully.');
        } catch (HasDependentRecordsException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to delete employee.');
        }
    }

    public function getEligibleForPayroll(GetEligibleForPayrollRequest $request, GetEligibleEmployeesForPayrollAction $action)
    {
        $validated = $request->validated();

        return response()->json($action($validated['month'], $validated['year']));
    }
}
