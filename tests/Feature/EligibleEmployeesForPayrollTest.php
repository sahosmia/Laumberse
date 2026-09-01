<?php

use App\Actions\Employees\GetEligibleEmployeesForPayrollAction;
use App\Models\Employee;
use App\Models\Payroll;
use App\Models\User;
use Illuminate\Support\Facades\DB;

test('an active employee with no payroll for the month is eligible with pending status', function () {
    $user = User::factory()->admin()->create();
    $employee = Employee::create([
        'name' => 'Jane', 'phone' => '01700000001', 'designation' => 'Staff', 'base_salary' => 15000, 'is_active' => true,
    ]);

    $response = $this->actingAs($user)->getJson(route('employees.payroll-eligible', ['month' => now()->month, 'year' => now()->year]));

    $response->assertOk();
    $response->assertJsonFragment(['id' => $employee->id, 'status' => 'pending', 'net_salary' => 15000]);
});

test('an employee already fully paid for the month is excluded', function () {
    $user = User::factory()->admin()->create();
    $employee = Employee::create([
        'name' => 'John', 'phone' => '01700000002', 'designation' => 'Staff', 'base_salary' => 15000, 'is_active' => true,
    ]);
    Payroll::create([
        'employee_id' => $employee->id,
        'month' => now()->month,
        'year' => now()->year,
        'base_salary' => 15000,
        'net_salary' => 15000,
        'paid_amount' => 15000,
        'status' => 'completed',
    ]);

    $response = $this->actingAs($user)->getJson(route('employees.payroll-eligible', ['month' => now()->month, 'year' => now()->year]));

    $response->assertOk();
    $response->assertJsonMissing(['id' => $employee->id]);
});

test('each eligible employee gets its own correct payroll values, in a fixed number of queries regardless of how many are eligible', function () {
    // Regression guard for the N+1 fix (P1.7): GetEligibleEmployeesForPayrollAction used to run
    // one extra Payroll query per eligible employee. This proves both that the values are still
    // correctly attributed to the right employee (not mixed up by the eager-load batching) and
    // that the query count no longer grows with the number of eligible employees.
    //
    // Invoked directly (not through the HTTP route) so the query count measures only the Action's
    // own queries — a full request also runs auth/permission/session queries that have nothing to
    // do with this Action and would make the assertion flaky against unrelated middleware changes.
    $noPayroll = Employee::create([
        'name' => 'No Payroll Yet', 'phone' => '01700000020', 'designation' => 'Staff', 'base_salary' => 15000, 'is_active' => true,
    ]);
    $partial = Employee::create([
        'name' => 'Partially Paid', 'phone' => '01700000021', 'designation' => 'Staff', 'base_salary' => 20000, 'is_active' => true,
    ]);
    $anotherPartial = Employee::create([
        'name' => 'Also Partially Paid', 'phone' => '01700000022', 'designation' => 'Staff', 'base_salary' => 30000, 'is_active' => true,
    ]);

    Payroll::create([
        'employee_id' => $partial->id, 'month' => now()->month, 'year' => now()->year,
        'base_salary' => 20000, 'bonus' => 1000, 'deduction' => 500, 'net_salary' => 20500,
        'paid_amount' => 10000, 'status' => 'partial',
    ]);
    Payroll::create([
        'employee_id' => $anotherPartial->id, 'month' => now()->month, 'year' => now()->year,
        'base_salary' => 30000, 'bonus' => 0, 'deduction' => 0, 'net_salary' => 30000,
        'paid_amount' => 15000, 'status' => 'partial',
    ]);

    DB::enableQueryLog();
    DB::flushQueryLog();

    $result = app(GetEligibleEmployeesForPayrollAction::class)(now()->month, now()->year);

    $queryCount = count(DB::getQueryLog());
    DB::disableQueryLog();

    expect($result)->toHaveCount(3);

    expect($result->firstWhere('id', $noPayroll->id))->toMatchArray([
        'already_paid' => 0, 'bonus' => 0, 'deduction' => 0, 'net_salary' => 15000, 'status' => 'pending',
    ]);
    expect($result->firstWhere('id', $partial->id))->toMatchArray([
        'already_paid' => 10000, 'bonus' => 1000, 'deduction' => 500, 'net_salary' => 20500, 'status' => 'partial',
    ]);
    expect($result->firstWhere('id', $anotherPartial->id))->toMatchArray([
        'already_paid' => 15000, 'bonus' => 0, 'deduction' => 0, 'net_salary' => 30000, 'status' => 'partial',
    ]);

    // 1 query for the employee scan (including its whereDoesntHave NOT EXISTS subquery) + 1
    // batched eager-load for every eligible employee's payroll — never "1 + N" per-employee queries.
    expect($queryCount)->toBe(2);
});
