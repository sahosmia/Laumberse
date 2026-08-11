<?php

use App\Models\Employee;
use App\Models\Payroll;
use App\Models\User;

test('an active employee with no payroll for the month is eligible with pending status', function () {
    $user = User::factory()->create();
    $employee = Employee::create([
        'name' => 'Jane', 'phone' => '01700000001', 'designation' => 'Staff', 'base_salary' => 15000, 'is_active' => true,
    ]);

    $response = $this->actingAs($user)->getJson(route('employees.payroll-eligible', ['month' => now()->month, 'year' => now()->year]));

    $response->assertOk();
    $response->assertJsonFragment(['id' => $employee->id, 'status' => 'pending', 'net_salary' => 15000]);
});

test('an employee already fully paid for the month is excluded', function () {
    $user = User::factory()->create();
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
