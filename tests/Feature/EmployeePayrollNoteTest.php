<?php

use App\Models\Account;
use App\Models\Employee;
use App\Models\ExpenseCategory;
use App\Models\GlobalSetting;
use App\Models\Payroll;
use App\Models\User;

// Coverage for the optional Payroll.note field: storePayroll() had no test at all before this
// file. Closes the gap and proves the note round-trips through to the employee's ledger.

function setUpPayrollFixtures(): array
{
    $user = User::factory()->admin()->create();
    $category = ExpenseCategory::create(['name' => 'Salary']);
    GlobalSetting::set('salary_category_id', $category->id);
    $account = Account::create(['name' => 'Cash', 'opening_balance' => 50000, 'current_balance' => 50000]);
    $employee = Employee::create([
        'name' => 'Jane', 'phone' => '01700000001', 'designation' => 'Staff', 'base_salary' => 15000, 'is_active' => true,
    ]);

    return [$user, $account, $employee];
}

test('a salary payment note is saved on the payroll record', function () {
    [$user, $account, $employee] = setUpPayrollFixtures();

    $this->actingAs($user)->post(route('employees.payroll.store', $employee), [
        'month' => now()->month,
        'year' => now()->year,
        'account_id' => $account->id,
        'date' => now()->toDateString(),
        'note' => 'Paid via mobile banking',
    ])->assertSessionHasNoErrors();

    $payroll = Payroll::where('employee_id', $employee->id)->first();
    expect($payroll->note)->toBe('Paid via mobile banking');
});

test('a salary payment with no note leaves the payroll note blank', function () {
    [$user, $account, $employee] = setUpPayrollFixtures();

    $this->actingAs($user)->post(route('employees.payroll.store', $employee), [
        'month' => now()->month,
        'year' => now()->year,
        'account_id' => $account->id,
        'date' => now()->toDateString(),
    ])->assertSessionHasNoErrors();

    $payroll = Payroll::where('employee_id', $employee->id)->first();
    expect($payroll->note)->toBeNull();
});

test('the employee ledger shows the custom payroll note instead of the default salary description', function () {
    [$user, $account, $employee] = setUpPayrollFixtures();

    $this->actingAs($user)->post(route('employees.payroll.store', $employee), [
        'month' => now()->month,
        'year' => now()->year,
        'account_id' => $account->id,
        'date' => now()->toDateString(),
        'note' => 'Paid via mobile banking',
    ]);

    $response = $this->actingAs($user)->get(route('employees.show', $employee));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('transactions.data.0.note', 'Paid via mobile banking')
    );
});

test('the employee ledger falls back to the default salary description when no note was set', function () {
    [$user, $account, $employee] = setUpPayrollFixtures();

    $this->actingAs($user)->post(route('employees.payroll.store', $employee), [
        'month' => now()->month,
        'year' => now()->year,
        'account_id' => $account->id,
        'date' => now()->toDateString(),
    ]);

    $response = $this->actingAs($user)->get(route('employees.show', $employee));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('transactions.data.0.note', "Salary - {$employee->name}")
    );
});
