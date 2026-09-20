<?php

use App\Models\Account;
use App\Models\Employee;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\GlobalSetting;
use App\Models\Outlet;
use App\Models\User;

/**
 * Regression guard: storePayroll() used to never pass outlet_id into ExpenseService::storeExpense(),
 * so OutletContext::resolveForWrite() threw while the admin was viewing "All Outlets" (it requires
 * an explicit outlet_id there) — salary payments failed in that mode even though the advance/loan
 * flow (EmployeeTransactionService, which never touches OutletContext at all) worked fine.
 */
test('a salary payment succeeds while viewing All Outlets and is attributed to the employee\'s own outlet', function () {
    $outletB = Outlet::factory()->create();
    $admin = User::factory()->admin()->create();
    $category = ExpenseCategory::create(['name' => 'Salary']);
    GlobalSetting::set('salary_category_id', $category->id);

    $employee = Employee::create([
        'name' => 'Jane', 'phone' => '01700000040', 'designation' => 'Staff',
        'base_salary' => 15000, 'is_active' => true, 'outlet_id' => $outletB->id,
    ]);
    $account = Account::create(['outlet_id' => $outletB->id, 'name' => 'Cash', 'opening_balance' => 50000, 'current_balance' => 50000]);

    test()->actingAs($admin)->post(route('outlet-context.update'), ['outlet' => 'all'])->assertRedirect();

    $response = test()->actingAs($admin)->post(route('employees.payroll.store', $employee), [
        'month' => now()->month,
        'year' => now()->year,
        'account_id' => $account->id,
        'date' => now()->toDateString(),
    ]);

    $response->assertSessionHasNoErrors();
    $expense = Expense::where('payroll_id', '!=', null)->latest('id')->first();
    expect($expense)->not->toBeNull();
    expect($expense->outlet_id)->toBe($outletB->id);
});
