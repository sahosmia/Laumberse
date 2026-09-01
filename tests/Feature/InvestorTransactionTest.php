<?php

use App\Models\Account;
use App\Models\Investor;
use App\Models\InvestorTransaction;
use App\Models\User;

test('an investor can be created with an opening balance', function () {
    $user = User::factory()->admin()->create();

    $this->actingAs($user)->post(route('investors.store'), [
        'name' => 'Jane Investor',
        'phone' => '01700000000',
        'opening_balance' => 10000,
    ])->assertSessionHasNoErrors();

    $investor = Investor::first();
    expect((float) $investor->opening_balance)->toBe(10000.0);
    expect((float) $investor->current_balance)->toBe(10000.0);
});

test('an investor\'s opening balance is recorded as its own ledger transaction with no account', function () {
    // Regression guard: opening balance used to only live in current_balance, with no visible
    // InvestorTransaction row — so it never showed up in the ledger table at all.
    $user = User::factory()->admin()->create();

    $this->actingAs($user)->post(route('investors.store'), [
        'name' => 'Jane Investor',
        'phone' => '01700000000',
        'opening_balance' => 10000,
    ])->assertSessionHasNoErrors();

    $investor = Investor::first();
    $this->assertDatabaseHas('investor_transactions', [
        'investor_id' => $investor->id,
        'account_id' => null,
        'transaction_type' => 'invest',
        'amount' => 10000,
        'note' => 'Opening balance',
    ]);
    expect(InvestorTransaction::where('investor_id', $investor->id)->count())->toBe(1);
});

test('an investor created with a zero opening balance does not create an opening-balance transaction', function () {
    $user = User::factory()->admin()->create();

    $this->actingAs($user)->post(route('investors.store'), [
        'name' => 'No Opening Balance',
        'phone' => '01700000000',
    ])->assertSessionHasNoErrors();

    $investor = Investor::first();
    expect(InvestorTransaction::where('investor_id', $investor->id)->count())->toBe(0);
});

test('the investor show page running balance includes the opening-balance ledger row plus later transactions', function () {
    $user = User::factory()->admin()->create();
    $account = Account::create(['name' => 'Bank', 'opening_balance' => 0, 'current_balance' => 0]);

    $this->actingAs($user)->post(route('investors.store'), [
        'name' => 'Jane Investor',
        'phone' => '01700000000',
        'opening_balance' => 1000,
    ]);
    $investor = Investor::first();

    $this->actingAs($user)->post(route('investors.transactions.store', $investor), [
        'transaction_type' => 'invest',
        'account_id' => $account->id,
        'amount' => 500,
        'date' => now()->format('Y-m-d'),
    ]);

    $response = $this->actingAs($user)->get(route('investors.show', $investor));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->has('transactions.data', 2)
        // Newest first: the 500 top-up transaction, then the 1000 opening-balance row.
        ->where('transactions.data.0.running_balance', fn ($value) => (float) $value === 1500.0)
        ->where('transactions.data.1.running_balance', fn ($value) => (float) $value === 1000.0)
        ->where('transactions.data.1.note', 'Opening balance')
        ->where('transactions.data.1.account_name', null)
    );
});

test('an invest transaction increases the investor and account balances', function () {
    $user = User::factory()->admin()->create();
    $investor = Investor::create(['name' => 'Jane', 'opening_balance' => 0, 'current_balance' => 0]);
    $account = Account::create(['name' => 'Bank', 'opening_balance' => 1000, 'current_balance' => 1000]);

    $response = $this->actingAs($user)->post(route('investors.transactions.store', $investor), [
        'transaction_type' => 'invest',
        'account_id' => $account->id,
        'amount' => 2000,
        'date' => now()->format('Y-m-d'),
        'note' => 'First investment',
    ]);

    $response->assertSessionHasNoErrors();

    expect((float) $investor->fresh()->current_balance)->toBe(2000.0);
    expect((float) $account->fresh()->current_balance)->toBe(3000.0);

    $this->assertDatabaseHas('investor_transactions', [
        'investor_id' => $investor->id,
        'transaction_type' => 'invest',
        'amount' => 2000,
    ]);

    $this->assertDatabaseHas('account_transactions', [
        'account_id' => $account->id,
        'type' => 'credit',
        'amount' => 2000,
    ]);
});

test('a withdraw transaction decreases the investor and account balances', function () {
    $user = User::factory()->admin()->create();
    $investor = Investor::create(['name' => 'Jane', 'opening_balance' => 5000, 'current_balance' => 5000]);
    $account = Account::create(['name' => 'Bank', 'opening_balance' => 5000, 'current_balance' => 5000]);

    $this->actingAs($user)->post(route('investors.transactions.store', $investor), [
        'transaction_type' => 'withdraw',
        'account_id' => $account->id,
        'amount' => 1500,
        'date' => now()->format('Y-m-d'),
    ])->assertSessionHasNoErrors();

    expect((float) $investor->fresh()->current_balance)->toBe(3500.0);
    expect((float) $account->fresh()->current_balance)->toBe(3500.0);

    $this->assertDatabaseHas('account_transactions', [
        'account_id' => $account->id,
        'type' => 'debit',
        'amount' => 1500,
    ]);
});

test('a withdraw larger than the investor\'s current balance is rejected', function () {
    $user = User::factory()->admin()->create();
    $investor = Investor::create(['name' => 'Jane', 'opening_balance' => 1000, 'current_balance' => 1000]);
    $account = Account::create(['name' => 'Bank', 'opening_balance' => 10000, 'current_balance' => 10000]);

    $response = $this->actingAs($user)->post(route('investors.transactions.store', $investor), [
        'transaction_type' => 'withdraw',
        'account_id' => $account->id,
        'amount' => 1500,
        'date' => now()->format('Y-m-d'),
    ]);

    $response->assertSessionHas('error');
    expect((float) $investor->fresh()->current_balance)->toBe(1000.0);
    expect((float) $account->fresh()->current_balance)->toBe(10000.0);
    expect(InvestorTransaction::count())->toBe(0);
});

test('investor transaction requires a valid transaction type and account', function () {
    $user = User::factory()->admin()->create();
    $investor = Investor::create(['name' => 'Jane', 'opening_balance' => 0, 'current_balance' => 0]);

    $this->actingAs($user)->post(route('investors.transactions.store', $investor), [
        'transaction_type' => 'invalid-type',
        'amount' => 100,
        'date' => now()->format('Y-m-d'),
    ])->assertSessionHasErrors(['transaction_type', 'account_id']);
});

test('the investor show page lists its paginated transactions', function () {
    $user = User::factory()->admin()->create();
    $investor = Investor::create(['name' => 'Jane', 'opening_balance' => 0, 'current_balance' => 0]);
    $account = Account::create(['name' => 'Bank', 'opening_balance' => 0, 'current_balance' => 0]);
    InvestorTransaction::create([
        'investor_id' => $investor->id,
        'account_id' => $account->id,
        'transaction_type' => 'invest',
        'amount' => 500,
        'date' => now()->format('Y-m-d'),
    ]);

    $response = $this->actingAs($user)->get(route('investors.show', $investor));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('investors/show')
        ->where('investor.id', $investor->id)
        ->has('transactions.data', 1)
    );
});

test('the investor show page running balance reflects full history even when narrowed by a date filter', function () {
    // Regression guard for the LedgerQuery::paginate() extraction (P1.3): the running-balance
    // window function must run over the investor's entire history before the date filter is
    // applied, not after.
    $user = User::factory()->admin()->create();
    $investor = Investor::create(['name' => 'Jane', 'opening_balance' => 1000, 'current_balance' => 1000]);
    $account = Account::create(['name' => 'Bank', 'opening_balance' => 0, 'current_balance' => 0]);

    // The opening balance must be its own ledger row (see InvestorService::createInvestor()) —
    // this test builds the Investor directly instead of through the service, so it inserts the
    // row by hand, dated before every other transaction below.
    InvestorTransaction::create([
        'investor_id' => $investor->id, 'account_id' => null,
        'transaction_type' => 'invest', 'amount' => 1000, 'date' => now()->subDays(20)->toDateString(),
        'note' => 'Opening balance',
    ]);

    InvestorTransaction::create([
        'investor_id' => $investor->id, 'account_id' => $account->id,
        'transaction_type' => 'invest', 'amount' => 500, 'date' => now()->subDays(10)->toDateString(),
    ]);
    InvestorTransaction::create([
        'investor_id' => $investor->id, 'account_id' => $account->id,
        'transaction_type' => 'withdraw', 'amount' => 200, 'date' => now()->subDays(5)->toDateString(),
    ]);
    // Deliberately dated today — this is the only row the "today" filter should show.
    InvestorTransaction::create([
        'investor_id' => $investor->id, 'account_id' => $account->id,
        'transaction_type' => 'invest', 'amount' => 100, 'date' => now()->toDateString(),
    ]);

    $response = $this->actingAs($user)->get(route('investors.show', $investor).'?date_filter=today');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->has('transactions.data', 1)
        ->where('transactions.data.0.running_balance', fn ($value) => (float) $value === 1400.0) // 1000 + 500 - 200 + 100
    );
});
