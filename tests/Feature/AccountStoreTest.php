<?php

use App\Models\Account;
use App\Models\AccountTransaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;

test('an account can be created with an opening balance and an initial credit transaction is logged', function () {
    $user = User::factory()->admin()->create();

    $response = $this->actingAs($user)->post(route('accounts.store'), [
        'name' => 'Main Cash Account',
        'account_number' => 'ACC-001',
        'opening_balance' => 5000,
    ]);

    $response->assertSessionHasNoErrors();

    $account = Account::first();
    expect($account)->not->toBeNull();
    expect((float) $account->opening_balance)->toBe(5000.0);
    expect((float) $account->current_balance)->toBe(5000.0);

    $this->assertDatabaseHas('account_transactions', [
        'account_id' => $account->id,
        'type' => 'credit',
        'amount' => 5000,
    ]);

    expect(AccountTransaction::where('account_id', $account->id)->count())->toBe(1);
});

test('an account created with a zero opening balance does not log a transaction', function () {
    $user = User::factory()->admin()->create();

    $this->actingAs($user)->post(route('accounts.store'), [
        'name' => 'Empty Account',
    ])->assertSessionHasNoErrors();

    $account = Account::first();
    expect((float) $account->current_balance)->toBe(0.0);
    expect(AccountTransaction::where('account_id', $account->id)->count())->toBe(0);
});

test('account creation requires a name', function () {
    $user = User::factory()->admin()->create();

    $this->actingAs($user)->post(route('accounts.store'), [
        'opening_balance' => 100,
    ])->assertSessionHasErrors('name');
});

test('the account show page lists its paginated transactions', function () {
    $user = User::factory()->admin()->create();
    $account = Account::create(['name' => 'Bank', 'opening_balance' => 0, 'current_balance' => 0]);
    AccountTransaction::create([
        'account_id' => $account->id,
        'type' => 'credit',
        'amount' => 100,
        'description' => 'Test credit',
    ]);

    $response = $this->actingAs($user)->get(route('accounts.show', $account));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('accounts/show')
        ->where('account.id', $account->id)
        ->has('transactions.data', 1)
    );
});

test('the account show page running balance reflects full history even when narrowed by a date filter', function () {
    // Regression guard for the LedgerQuery::paginate() extraction (P1.3): the running-balance
    // window function must run over the account's entire history before the date filter is
    // applied, not after — otherwise a filtered view would show a running balance that's missing
    // everything before the filtered window.
    $user = User::factory()->admin()->create();
    $account = Account::create(['name' => 'Bank', 'opening_balance' => 0, 'current_balance' => 0]);

    $older = AccountTransaction::create(['account_id' => $account->id, 'type' => 'credit', 'amount' => 100]);
    DB::table('account_transactions')->where('id', $older->id)->update(['created_at' => now()->subDays(10)]);

    $older2 = AccountTransaction::create(['account_id' => $account->id, 'type' => 'debit', 'amount' => 30]);
    DB::table('account_transactions')->where('id', $older2->id)->update(['created_at' => now()->subDays(5)]);

    // Deliberately not backdated — this is the only row the "today" filter should show.
    AccountTransaction::create(['account_id' => $account->id, 'type' => 'credit', 'amount' => 50]);

    $response = $this->actingAs($user)->get(route('accounts.show', $account).'?date_filter=today');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->has('transactions.data', 1)
        ->where('transactions.data.0.running_balance', fn ($value) => (float) $value === 120.0)
    );
});
