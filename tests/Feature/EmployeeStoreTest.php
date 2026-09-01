<?php

use App\Models\Employee;
use App\Models\User;

test('employee id is auto-generated when not provided', function () {
    $user = User::factory()->admin()->create();

    $response = $this->actingAs($user)->post(route('employees.store'), [
        'name' => 'Jane',
        'phone' => '01700000001',
        'designation' => 'Staff',
        'base_salary' => 15000,
    ]);

    $response->assertSessionHasNoErrors();
    $employee = Employee::first();
    expect($employee->employee_id)->not->toBeEmpty();
});

test('an employee can be created with a blank opening balance', function () {
    // Regression guard: opening_balance is optional in StoreEmployeeRequest ('nullable'), but a
    // blank value converts to null before it reaches Employee::create(). The employees table
    // column has a DB-level default(0) but is NOT nullable, so inserting an explicit null used to
    // fail with a raw SQL "NOT NULL constraint failed" error — swallowed by the controller's
    // generic \Throwable catch into an unhelpful "Failed to add employee." message.
    $user = User::factory()->admin()->create();

    $response = $this->actingAs($user)->post(route('employees.store'), [
        'name' => 'Jane',
        'phone' => '01700000001',
        'designation' => 'Staff',
        'base_salary' => 15000,
        'opening_balance' => '',
    ]);

    $response->assertSessionHasNoErrors();
    $employee = Employee::first();
    expect($employee)->not->toBeNull();
    expect((float) $employee->opening_balance)->toBe(0.0);
    expect((float) $employee->current_balance)->toBe(0.0);
});

test('employee id can be set to a custom value', function () {
    $user = User::factory()->admin()->create();

    $response = $this->actingAs($user)->post(route('employees.store'), [
        'employee_id' => 'STAFF-007',
        'name' => 'Jane',
        'phone' => '01700000001',
        'designation' => 'Staff',
        'base_salary' => 15000,
    ]);

    $response->assertSessionHasNoErrors();
    $this->assertDatabaseHas('employees', ['employee_id' => 'STAFF-007']);
});

test('employee id must be unique on store', function () {
    $user = User::factory()->admin()->create();
    Employee::create([
        'employee_id' => 'STAFF-007',
        'name' => 'Existing',
        'phone' => '01700000000',
        'designation' => 'Staff',
        'base_salary' => 10000,
        'is_active' => true,
    ]);

    $response = $this->actingAs($user)->post(route('employees.store'), [
        'employee_id' => 'STAFF-007',
        'name' => 'Jane',
        'phone' => '01700000001',
        'designation' => 'Staff',
        'base_salary' => 15000,
    ]);

    $response->assertSessionHasErrors(['employee_id']);
});

test('two auto-generated employee ids do not collide', function () {
    $user = User::factory()->admin()->create();

    $this->actingAs($user)->post(route('employees.store'), [
        'name' => 'Jane',
        'phone' => '01700000001',
        'designation' => 'Staff',
        'base_salary' => 15000,
    ]);
    $this->actingAs($user)->post(route('employees.store'), [
        'name' => 'John',
        'phone' => '01700000002',
        'designation' => 'Staff',
        'base_salary' => 15000,
    ]);

    $ids = Employee::pluck('employee_id');
    expect($ids)->toHaveCount(2);
    expect($ids[0])->not->toBe($ids[1]);
});

test('employee id is preserved on update when left blank', function () {
    $user = User::factory()->admin()->create();
    $employee = Employee::create([
        'employee_id' => 'STAFF-007',
        'name' => 'Jane',
        'phone' => '01700000001',
        'designation' => 'Staff',
        'base_salary' => 15000,
        'is_active' => true,
    ]);

    $response = $this->actingAs($user)->put(route('employees.update', $employee), [
        'name' => 'Jane Updated',
        'phone' => '01700000001',
        'designation' => 'Staff',
        'base_salary' => 15000,
        'is_active' => true,
    ]);

    $response->assertSessionHasNoErrors();
    $employee->refresh();
    expect($employee->employee_id)->toBe('STAFF-007');
    expect($employee->name)->toBe('Jane Updated');
});
