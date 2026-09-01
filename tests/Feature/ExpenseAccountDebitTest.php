<?php

use App\Models\Account;
use App\Models\AccountTransaction;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\GlobalSetting;
use App\Models\Material;
use App\Models\User;

test('storing an expense debits the selected account', function () {
    $user = User::factory()->admin()->create();
    $category = ExpenseCategory::create(['name' => 'General', 'description' => 'd']);
    $account = Account::create(['name' => 'Cash', 'opening_balance' => 10000, 'current_balance' => 10000]);

    $this->actingAs($user)->post(route('expenses.store'), [
        'expense_category_id' => $category->id,
        'account_id' => $account->id,
        'amount' => 1500,
        'date' => now()->format('Y-m-d'),
        'description' => 'Office supplies',
    ])->assertSessionHasNoErrors();

    $expense = Expense::first();

    expect((float) $account->fresh()->current_balance)->toBe(8500.0);
    $this->assertDatabaseHas('account_transactions', [
        'account_id' => $account->id,
        'type' => 'debit',
        'amount' => 1500,
        'reference_type' => Expense::class,
        'reference_id' => $expense->id,
    ]);
});

test('a material expense debits the account using the recalculated total, not the submitted amount', function () {
    $user = User::factory()->admin()->create();
    $category = ExpenseCategory::create(['name' => 'Material Purchases', 'description' => 'd']);
    GlobalSetting::set('material_expense_category_id', $category->id);
    $account = Account::create(['name' => 'Cash', 'opening_balance' => 10000, 'current_balance' => 10000]);
    $material = Material::create(['name' => 'Fabric X']);

    $this->actingAs($user)->post(route('expenses.store'), [
        'expense_category_id' => $category->id,
        'account_id' => $account->id,
        'amount' => 1, // deliberately wrong; the real total comes from line items
        'date' => now()->format('Y-m-d'),
        'items' => [
            ['material_id' => $material->id, 'quantity' => 10, 'unit_price' => 50],
        ],
    ])->assertSessionHasNoErrors();

    // 10 * 50 = 500, not the submitted 1
    expect((float) $account->fresh()->current_balance)->toBe(9500.0);
    $this->assertDatabaseHas('account_transactions', [
        'account_id' => $account->id,
        'type' => 'debit',
        'amount' => 500,
    ]);
});

test('updating an expense reverses the old debit and applies a new one', function () {
    $user = User::factory()->admin()->create();
    $category = ExpenseCategory::create(['name' => 'General', 'description' => 'd']);
    $accountA = Account::create(['name' => 'Cash', 'opening_balance' => 10000, 'current_balance' => 10000]);
    $accountB = Account::create(['name' => 'Bank', 'opening_balance' => 10000, 'current_balance' => 10000]);

    $this->actingAs($user)->post(route('expenses.store'), [
        'expense_category_id' => $category->id,
        'account_id' => $accountA->id,
        'amount' => 1000,
        'date' => now()->format('Y-m-d'),
    ]);
    $expense = Expense::first();
    expect((float) $accountA->fresh()->current_balance)->toBe(9000.0);

    $this->actingAs($user)->put(route('expenses.update', $expense), [
        'expense_category_id' => $category->id,
        'account_id' => $accountB->id,
        'amount' => 400,
        'date' => now()->format('Y-m-d'),
    ])->assertSessionHasNoErrors();

    expect((float) $accountA->fresh()->current_balance)->toBe(10000.0);
    expect((float) $accountB->fresh()->current_balance)->toBe(9600.0);
    expect(AccountTransaction::where('account_id', $accountA->id)->count())->toBe(0);
    $this->assertDatabaseHas('account_transactions', [
        'account_id' => $accountB->id,
        'type' => 'debit',
        'amount' => 400,
        'reference_type' => Expense::class,
        'reference_id' => $expense->id,
    ]);
});

test('deleting an expense reverses its debit and restores the account balance', function () {
    $user = User::factory()->admin()->create();
    $category = ExpenseCategory::create(['name' => 'General', 'description' => 'd']);
    $account = Account::create(['name' => 'Cash', 'opening_balance' => 10000, 'current_balance' => 10000]);

    $this->actingAs($user)->post(route('expenses.store'), [
        'expense_category_id' => $category->id,
        'account_id' => $account->id,
        'amount' => 2000,
        'date' => now()->format('Y-m-d'),
    ]);
    $expense = Expense::first();
    expect((float) $account->fresh()->current_balance)->toBe(8000.0);

    $this->actingAs($user)->delete(route('expenses.destroy', $expense))->assertSessionHasNoErrors();

    expect((float) $account->fresh()->current_balance)->toBe(10000.0);
    expect(AccountTransaction::count())->toBe(0);
});
