<?php

use App\Models\Account;
use App\Models\Employee;
use App\Models\Outlet;
use App\Models\User;

/** Same security matrix pattern as InvoiceOutletIsolationTest — see that file's header comment. */
function makeEmployeeFor(User $user, array $overrides = []): Employee
{
    $data = array_merge([
        'name' => 'Employee-'.uniqid(),
        'phone' => '017'.random_int(10000000, 99999999),
        'designation' => 'Staff',
        'base_salary' => 20000,
    ], $overrides);

    test()->actingAs($user)->post(route('employees.store'), $data)->assertSessionHasNoErrors();

    return Employee::latest('id')->first();
}

test('a user only sees employees from their own outlet in the index', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Manager');
    $userB = User::factory()->for($outletB, 'outlet')->create();
    $userB->assignRole('Manager');

    $employeeA = makeEmployeeFor($userA);
    $employeeB = makeEmployeeFor($userB);

    $response = test()->actingAs($userA)->get(route('employees.index'));

    $ids = collect($response->viewData('page')['props']['employees']['data'])->pluck('id');
    expect($ids)->toContain($employeeA->id);
    expect($ids)->not->toContain($employeeB->id);
});

test('a user cannot view another outlet\'s employee directly by id', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Manager');
    $userB = User::factory()->for($outletB, 'outlet')->create();
    $userB->assignRole('Manager');

    $employeeB = makeEmployeeFor($userB);

    test()->actingAs($userA)->get(route('employees.show', $employeeB))->assertNotFound();
});

test('a user cannot update another outlet\'s employee', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Manager');
    $userB = User::factory()->for($outletB, 'outlet')->create();
    $userB->assignRole('Manager');

    $employeeB = makeEmployeeFor($userB);
    $originalName = $employeeB->name;

    test()->actingAs($userA)->put(route('employees.update', $employeeB), [
        'name' => 'Hacked Name',
        'phone' => $employeeB->phone,
        'designation' => $employeeB->designation,
        'base_salary' => $employeeB->base_salary,
        'is_active' => true,
    ])->assertNotFound();

    expect($employeeB->fresh()->name)->toBe($originalName);
});

test('a user cannot delete another outlet\'s employee', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Manager');
    $userB = User::factory()->for($outletB, 'outlet')->create();
    $userB->assignRole('Manager');

    $employeeB = makeEmployeeFor($userB);

    test()->actingAs($userA)->delete(route('employees.destroy', $employeeB))->assertNotFound();

    expect(Employee::find($employeeB->id))->not->toBeNull();
});

test('a user cannot record an advance/loan transaction against another outlet\'s employee', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->admin()->create();
    $userB = User::factory()->for($outletB, 'outlet')->create();
    $userB->assignRole('Manager');

    $employeeB = makeEmployeeFor($userB);
    $account = Account::create(['name' => 'Cash', 'opening_balance' => 10000, 'current_balance' => 10000]);

    // $userA is Admin (defaults to its own home outlet, not "all"), so it's still cross-outlet
    // relative to $employeeB despite holding every permission.
    test()->actingAs($userA)->post(route('employees.transactions.store', $employeeB), [
        'transaction_type' => 'advance',
        'account_id' => $account->id,
        'amount' => 500,
        'date' => now()->format('Y-m-d'),
    ])->assertNotFound();
});

test('an employee is always assigned to the creator\'s own outlet, even if a different outlet_id is forged in the payload', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Manager');

    $employee = makeEmployeeFor($userA, ['outlet_id' => $outletB->id]);

    expect($employee->outlet_id)->toBe($userA->outlet_id)
        ->and($employee->outlet_id)->not->toBe($outletB->id);
});

test('an admin who switches to All Outlets sees employees from every outlet', function () {
    $outletB = Outlet::factory()->create();
    $admin = User::factory()->admin()->create();
    $userB = User::factory()->for($outletB, 'outlet')->create();
    $userB->assignRole('Manager');

    $employeeAdmin = makeEmployeeFor($admin);
    $employeeB = makeEmployeeFor($userB);

    test()->actingAs($admin)->post(route('outlet-context.update'), ['outlet' => 'all'])
        ->assertRedirect()->assertSessionHasNoErrors();

    $response = test()->actingAs($admin)->get(route('employees.index'));

    $ids = collect($response->viewData('page')['props']['employees']['data'])->pluck('id');
    expect($ids)->toContain($employeeAdmin->id);
    expect($ids)->toContain($employeeB->id);
});

test('creating an employee while viewing All Outlets requires a valid outlet_id', function () {
    $admin = User::factory()->admin()->create();
    test()->actingAs($admin)->post(route('outlet-context.update'), ['outlet' => 'all'])
        ->assertRedirect()->assertSessionHasNoErrors();

    $response = test()->actingAs($admin)->post(route('employees.store'), [
        'name' => 'New Employee',
        'phone' => '01700000000',
        'designation' => 'Staff',
        'base_salary' => 20000,
    ]);

    $response->assertSessionHasErrors(['outlet_id']);
});

test('payroll eligibility list only includes employees from the current outlet scope', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Manager');
    $userA->givePermissionTo('payroll.create');
    $userB = User::factory()->for($outletB, 'outlet')->create();
    $userB->assignRole('Manager');

    $employeeA = makeEmployeeFor($userA);
    $employeeB = makeEmployeeFor($userB);

    $now = now();
    $response = test()->actingAs($userA)->getJson(route('employees.payroll-eligible', ['month' => $now->month, 'year' => $now->year]));

    $ids = collect($response->json())->pluck('id');
    expect($ids)->toContain($employeeA->id);
    expect($ids)->not->toContain($employeeB->id);
});
