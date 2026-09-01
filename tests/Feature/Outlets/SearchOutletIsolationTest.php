<?php

use App\Models\Outlet;
use App\Models\User;

/**
 * Confirms the newly added global-search sections (Employees, Expenses, Assets, Accounts,
 * Meetings) respect outlet scope, same as Invoice search already does (see
 * InvoiceOutletIsolationTest's "invoice search only returns results from the current outlet
 * scope"). Clients/Products/Notes/Users/Outlets are intentionally NOT outlet-scoped, so they're
 * not covered here.
 */
test('employee search only returns results from the current outlet scope', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Manager');
    $userB = User::factory()->for($outletB, 'outlet')->create();
    $userB->assignRole('Manager');

    $employeeA = makeEmployeeFor($userA, ['name' => 'Zzsearchable Employee A']);
    $employeeB = makeEmployeeFor($userB, ['name' => 'Zzsearchable Employee B']);

    $response = test()->actingAs($userA)->getJson(route('search', ['q' => 'Zzsearchable']));

    $ids = collect($response->json('employees'))->pluck('id');
    expect($ids)->toContain($employeeA->id);
    expect($ids)->not->toContain($employeeB->id);
});

test('expense search only returns results from the current outlet scope', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Accountant');
    $userB = User::factory()->for($outletB, 'outlet')->create();
    $userB->assignRole('Accountant');

    $expenseA = makeExpenseFor($userA, ['description' => 'Zzsearchable Expense A']);
    $expenseB = makeExpenseFor($userB, ['description' => 'Zzsearchable Expense B']);

    $response = test()->actingAs($userA)->getJson(route('search', ['q' => 'Zzsearchable']));

    $ids = collect($response->json('expenses'))->pluck('id');
    expect($ids)->toContain($expenseA->id);
    expect($ids)->not->toContain($expenseB->id);
});

test('asset search only returns results from the current outlet scope', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Manager');
    $userB = User::factory()->for($outletB, 'outlet')->create();
    $userB->assignRole('Manager');

    $assetA = makeAssetFor($userA, ['name' => 'Zzsearchable Asset A']);
    $assetB = makeAssetFor($userB, ['name' => 'Zzsearchable Asset B']);

    $response = test()->actingAs($userA)->getJson(route('search', ['q' => 'Zzsearchable']));

    $ids = collect($response->json('assets'))->pluck('id');
    expect($ids)->toContain($assetA->id);
    expect($ids)->not->toContain($assetB->id);
});

test('account search only returns results from the current outlet scope', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Accountant');
    $userB = User::factory()->for($outletB, 'outlet')->create();
    $userB->assignRole('Accountant');

    $accountA = makeAccountFor($userA, ['name' => 'Zzsearchable Account A']);
    $accountB = makeAccountFor($userB, ['name' => 'Zzsearchable Account B']);

    $response = test()->actingAs($userA)->getJson(route('search', ['q' => 'Zzsearchable']));

    $ids = collect($response->json('accounts'))->pluck('id');
    expect($ids)->toContain($accountA->id);
    expect($ids)->not->toContain($accountB->id);
});

test('meeting search only returns results from the current outlet scope', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Sales Staff');
    $userB = User::factory()->for($outletB, 'outlet')->create();
    $userB->assignRole('Sales Staff');

    $activityA = makeActivityFor($userA, null, ['note' => 'Zzsearchable Meeting A']);
    $activityB = makeActivityFor($userB, null, ['note' => 'Zzsearchable Meeting B']);

    $response = test()->actingAs($userA)->getJson(route('search', ['q' => 'Zzsearchable']));

    $ids = collect($response->json('meetings'))->pluck('id');
    expect($ids)->toContain($activityA->id);
    expect($ids)->not->toContain($activityB->id);
});
