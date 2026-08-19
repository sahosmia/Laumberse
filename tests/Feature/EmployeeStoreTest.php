<?php

use App\Models\Employee;
use App\Models\User;

test('employee id is auto-generated when not provided', function () {
    $user = User::factory()->create();

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

test('employee id can be set to a custom value', function () {
    $user = User::factory()->create();

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
    $user = User::factory()->create();
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
    $user = User::factory()->create();

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
    $user = User::factory()->create();
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
