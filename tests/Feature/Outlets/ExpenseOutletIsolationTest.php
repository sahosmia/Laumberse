<?php

use App\Models\Account;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\Outlet;
use App\Models\User;

/** Same security matrix pattern as InvoiceOutletIsolationTest — see that file's header comment. */
function makeExpenseFor(User $user, array $overrides = []): Expense
{
    $category = ExpenseCategory::create(['name' => 'Cat-'.uniqid(), 'description' => 'General']);
    // Must match $user's own outlet — Account defaults to the oldest outlet otherwise, which
    // would fail the account_id/outlet_id cross-check in StoreExpenseRequest for any $user not
    // on that oldest outlet.
    $account = Account::create(['outlet_id' => $user->outlet_id, 'name' => 'Cash-'.uniqid(), 'opening_balance' => 10000, 'current_balance' => 10000]);

    $data = array_merge([
        'expense_category_id' => $category->id,
        'account_id' => $account->id,
        'amount' => 150,
        'date' => now()->format('Y-m-d'),
        'description' => 'Test expense',
    ], $overrides);

    test()->actingAs($user)->post(route('expenses.store'), $data)->assertSessionHasNoErrors();

    return Expense::latest('id')->first();
}

test('a user only sees expenses from their own outlet in the index', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Accountant');
    $userB = User::factory()->for($outletB, 'outlet')->create();
    $userB->assignRole('Accountant');

    $expenseA = makeExpenseFor($userA);
    $expenseB = makeExpenseFor($userB);

    $response = test()->actingAs($userA)->get(route('expenses.index'));

    $ids = collect($response->viewData('page')['props']['expenses']['data'])->pluck('id');
    expect($ids)->toContain($expenseA->id);
    expect($ids)->not->toContain($expenseB->id);
});

test('a user cannot view another outlet\'s expense directly by id', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Accountant');
    $userB = User::factory()->for($outletB, 'outlet')->create();
    $userB->assignRole('Accountant');

    $expenseB = makeExpenseFor($userB);

    test()->actingAs($userA)->get(route('expenses.show', $expenseB))->assertNotFound();
});

test('a user cannot update another outlet\'s expense', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Accountant');
    $userB = User::factory()->for($outletB, 'outlet')->create();
    $userB->assignRole('Accountant');

    $expenseB = makeExpenseFor($userB);
    $originalAmount = $expenseB->amount;

    test()->actingAs($userA)->put(route('expenses.update', $expenseB), [
        'expense_category_id' => $expenseB->expense_category_id,
        'account_id' => $expenseB->account_id,
        'amount' => 999,
        'date' => now()->format('Y-m-d'),
    ])->assertNotFound();

    expect((float) $expenseB->fresh()->amount)->toEqual((float) $originalAmount);
});

test('a user cannot delete another outlet\'s expense', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Accountant');
    $userB = User::factory()->for($outletB, 'outlet')->create();
    $userB->assignRole('Accountant');

    $expenseB = makeExpenseFor($userB);

    test()->actingAs($userA)->delete(route('expenses.destroy', $expenseB))->assertNotFound();

    expect(Expense::find($expenseB->id))->not->toBeNull();
});

test('an expense is always assigned to the creator\'s own outlet, even if a different outlet_id is forged in the payload', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Accountant');

    $expense = makeExpenseFor($userA, ['outlet_id' => $outletB->id]);

    expect($expense->outlet_id)->toBe($userA->outlet_id)
        ->and($expense->outlet_id)->not->toBe($outletB->id);
});

test('an admin who switches to All Outlets sees expenses from every outlet', function () {
    $outletB = Outlet::factory()->create();
    $admin = User::factory()->admin()->create();
    $userB = User::factory()->for($outletB, 'outlet')->create();
    $userB->assignRole('Accountant');

    $expenseAdmin = makeExpenseFor($admin);
    $expenseB = makeExpenseFor($userB);

    test()->actingAs($admin)->post(route('outlet-context.update'), ['outlet' => 'all'])
        ->assertRedirect()->assertSessionHasNoErrors();

    $response = test()->actingAs($admin)->get(route('expenses.index'));

    $ids = collect($response->viewData('page')['props']['expenses']['data'])->pluck('id');
    expect($ids)->toContain($expenseAdmin->id);
    expect($ids)->toContain($expenseB->id);
});

test('creating an expense while viewing All Outlets requires a valid outlet_id', function () {
    $admin = User::factory()->admin()->create();
    test()->actingAs($admin)->post(route('outlet-context.update'), ['outlet' => 'all'])
        ->assertRedirect()->assertSessionHasNoErrors();

    $category = ExpenseCategory::create(['name' => 'Cat', 'description' => 'General']);
    $account = Account::create(['name' => 'Cash', 'opening_balance' => 0, 'current_balance' => 0]);

    $response = test()->actingAs($admin)->post(route('expenses.store'), [
        'expense_category_id' => $category->id,
        'account_id' => $account->id,
        'amount' => 150,
        'date' => now()->format('Y-m-d'),
    ]);

    $response->assertSessionHasErrors(['outlet_id']);
});
