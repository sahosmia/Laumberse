<?php

use App\Models\Account;
use App\Models\AccountTransaction;
use App\Models\Employee;
use App\Models\EmployeeTransaction;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\Payroll;
use App\Models\User;

function createEmployee(array $overrides = []): Employee
{
    return Employee::create(array_merge([
        'name' => 'Jane Staff',
        'phone' => '01700000000',
        'designation' => 'Sales',
        'base_salary' => 15000,
    ], $overrides));
}

test('an employee current_balance is initialized from opening_balance on creation', function () {
    $user = User::factory()->admin()->create();

    $this->actingAs($user)->post(route('employees.store'), [
        'name' => 'Jane',
        'phone' => '01700000001',
        'designation' => 'Staff',
        'base_salary' => 15000,
        'opening_balance' => 2000,
    ])->assertSessionHasNoErrors();

    $employee = Employee::first();
    expect((float) $employee->opening_balance)->toBe(2000.0);
    expect((float) $employee->current_balance)->toBe(2000.0);
});

test('an employee created without an opening balance defaults its current_balance to zero', function () {
    $user = User::factory()->admin()->create();

    $this->actingAs($user)->post(route('employees.store'), [
        'name' => 'Jane',
        'phone' => '01700000001',
        'designation' => 'Staff',
        'base_salary' => 15000,
    ])->assertSessionHasNoErrors();

    $employee = Employee::first();
    expect((float) $employee->current_balance)->toBe(0.0);
});

test('a salary transaction type is rejected — salary is paid through Expenses, not here', function () {
    $user = User::factory()->admin()->create();
    $employee = createEmployee();
    $account = Account::create(['name' => 'Bank', 'opening_balance' => 10000, 'current_balance' => 10000]);

    $this->actingAs($user)->post(route('employees.transactions.store', $employee), [
        'transaction_type' => 'salary',
        'account_id' => $account->id,
        'amount' => 15000,
        'date' => now()->format('Y-m-d'),
        'note' => 'August salary',
    ])->assertSessionHasErrors('transaction_type');

    expect((float) $employee->fresh()->current_balance)->toBe(0.0);
    expect((float) $account->fresh()->current_balance)->toBe(10000.0);
    expect(EmployeeTransaction::count())->toBe(0);
});

test('an advance transaction debits the payment account and increases the employee balance', function () {
    $user = User::factory()->admin()->create();
    $employee = createEmployee();
    $account = Account::create(['name' => 'Bank', 'opening_balance' => 10000, 'current_balance' => 10000]);

    $this->actingAs($user)->post(route('employees.transactions.store', $employee), [
        'transaction_type' => 'advance',
        'account_id' => $account->id,
        'amount' => 2000,
        'date' => now()->format('Y-m-d'),
    ])->assertSessionHasNoErrors();

    expect((float) $employee->fresh()->current_balance)->toBe(2000.0);
    expect((float) $account->fresh()->current_balance)->toBe(8000.0);

    $this->assertDatabaseHas('account_transactions', [
        'account_id' => $account->id,
        'type' => 'debit',
        'amount' => 2000,
    ]);
});

test('a loan transaction debits the payment account and increases the employee balance', function () {
    $user = User::factory()->admin()->create();
    $employee = createEmployee();
    $account = Account::create(['name' => 'Bank', 'opening_balance' => 10000, 'current_balance' => 10000]);

    $this->actingAs($user)->post(route('employees.transactions.store', $employee), [
        'transaction_type' => 'loan',
        'account_id' => $account->id,
        'amount' => 5000,
        'date' => now()->format('Y-m-d'),
    ])->assertSessionHasNoErrors();

    expect((float) $employee->fresh()->current_balance)->toBe(5000.0);
    expect((float) $account->fresh()->current_balance)->toBe(5000.0);

    $this->assertDatabaseHas('account_transactions', [
        'account_id' => $account->id,
        'type' => 'debit',
        'amount' => 5000,
    ]);
});

test('a loan_return transaction credits the payment account and decreases the employee balance', function () {
    $user = User::factory()->admin()->create();
    $employee = createEmployee(['opening_balance' => 5000, 'current_balance' => 5000]);
    $account = Account::create(['name' => 'Bank', 'opening_balance' => 10000, 'current_balance' => 10000]);

    $this->actingAs($user)->post(route('employees.transactions.store', $employee), [
        'transaction_type' => 'loan_return',
        'account_id' => $account->id,
        'amount' => 1500,
        'date' => now()->format('Y-m-d'),
    ])->assertSessionHasNoErrors();

    expect((float) $employee->fresh()->current_balance)->toBe(3500.0);
    expect((float) $account->fresh()->current_balance)->toBe(11500.0);

    $this->assertDatabaseHas('account_transactions', [
        'account_id' => $account->id,
        'type' => 'credit',
        'amount' => 1500,
    ]);
});

test('a loan_return larger than the employee\'s outstanding balance is rejected', function () {
    $user = User::factory()->admin()->create();
    $employee = createEmployee(['opening_balance' => 1000, 'current_balance' => 1000]);
    $account = Account::create(['name' => 'Bank', 'opening_balance' => 10000, 'current_balance' => 10000]);

    $response = $this->actingAs($user)->post(route('employees.transactions.store', $employee), [
        'transaction_type' => 'loan_return',
        'account_id' => $account->id,
        'amount' => 1500,
        'date' => now()->format('Y-m-d'),
    ]);

    $response->assertSessionHas('error');
    expect((float) $employee->fresh()->current_balance)->toBe(1000.0);
    expect((float) $account->fresh()->current_balance)->toBe(10000.0);
    expect(EmployeeTransaction::count())->toBe(0);
});

test('employee transaction requires a valid transaction type, account, and positive amount', function () {
    $user = User::factory()->admin()->create();
    $employee = createEmployee();

    $this->actingAs($user)->post(route('employees.transactions.store', $employee), [
        'transaction_type' => 'invalid-type',
        'amount' => -10,
        'date' => now()->format('Y-m-d'),
    ])->assertSessionHasErrors(['transaction_type', 'account_id', 'amount']);
});

test('employee transactions are wrapped atomically and do not partially apply on failure', function () {
    $user = User::factory()->admin()->create();
    $employee = createEmployee();
    $account = Account::create(['name' => 'Bank', 'opening_balance' => 10000, 'current_balance' => 10000]);

    $this->actingAs($user)->post(route('employees.transactions.store', $employee), [
        'transaction_type' => 'advance',
        'account_id' => $account->id,
        'amount' => 0,
        'date' => now()->format('Y-m-d'),
    ])->assertSessionHasErrors('amount');

    expect((float) $employee->fresh()->current_balance)->toBe(0.0);
    expect(EmployeeTransaction::count())->toBe(0);
    expect(AccountTransaction::count())->toBe(0);
});

test('the employee show page lists its paginated transactions', function () {
    $user = User::factory()->admin()->create();
    $employee = createEmployee();
    $account = Account::create(['name' => 'Bank', 'opening_balance' => 0, 'current_balance' => 0]);
    EmployeeTransaction::create([
        'employee_id' => $employee->id,
        'account_id' => $account->id,
        'transaction_type' => 'advance',
        'amount' => 500,
        'date' => now()->format('Y-m-d'),
    ]);

    $response = $this->actingAs($user)->get(route('employees.show', $employee));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('employees/show')
        ->where('employee.id', $employee->id)
        ->has('transactions.data', 1)
    );
});

test('the employee show page running balance reflects full history even when narrowed by a date filter, and salary rows do not affect it', function () {
    // Regression guard for the LedgerQuery::paginate() extraction (P1.3): the running-balance
    // window function must run over the employee's entire merged (advance/loan/loan_return UNION
    // salary) history before the date filter is applied, not after — and salary rows must
    // continue to contribute 0 to the running balance, since only advance/loan/loan_return move
    // an employee's current_balance.
    $user = User::factory()->admin()->create();
    $employee = createEmployee();
    $account = Account::create(['name' => 'Bank', 'opening_balance' => 10000, 'current_balance' => 10000]);

    EmployeeTransaction::create([
        'employee_id' => $employee->id, 'account_id' => $account->id,
        'transaction_type' => 'advance', 'amount' => 2000, 'date' => now()->subDays(10)->toDateString(),
    ]);
    EmployeeTransaction::create([
        'employee_id' => $employee->id, 'account_id' => $account->id,
        'transaction_type' => 'loan_return', 'amount' => 500, 'date' => now()->subDays(5)->toDateString(),
    ]);

    $category = ExpenseCategory::create(['name' => 'Salary Test']);
    $payroll = Payroll::create([
        'employee_id' => $employee->id, 'month' => now()->month, 'year' => now()->year,
        'base_salary' => 5000, 'net_salary' => 5000, 'paid_amount' => 5000, 'status' => 'completed',
    ]);
    // Deliberately dated today — this is the only row the "today" filter should show.
    Expense::create([
        'expense_category_id' => $category->id, 'account_id' => $account->id, 'payroll_id' => $payroll->id,
        'type' => 'salary', 'amount' => 5000, 'payment_method' => 'Bank',
        'date' => now()->toDateString(), 'description' => 'Salary',
    ]);

    $response = $this->actingAs($user)->get(route('employees.show', $employee).'?date_filter=today');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->has('transactions.data', 1)
        ->where('transactions.data.0.source', 'salary')
        ->where('transactions.data.0.running_balance', fn ($value) => (float) $value === 1500.0) // 2000 - 500, salary contributes 0
    );
});
