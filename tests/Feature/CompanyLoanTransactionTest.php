<?php

use App\Models\Account;
use App\Models\AccountTransaction;
use App\Models\CompanyLoan;
use App\Models\CompanyLoanTransaction;
use App\Models\User;

test('a company loan can be recorded with an initial principal', function () {
    $user = User::factory()->admin()->create();

    $this->actingAs($user)->post(route('company-loans.store'), [
        'lender_name' => 'ABC Bank',
        'initial_loan_amount' => 100000,
    ])->assertSessionHasNoErrors();

    $loan = CompanyLoan::first();
    expect((float) $loan->initial_loan_amount)->toBe(100000.0);
    expect((float) $loan->current_balance)->toBe(100000.0);
});

test('a loan transaction increases the loan balance and credits the payment account', function () {
    $user = User::factory()->admin()->create();
    $loan = CompanyLoan::create(['lender_name' => 'ABC Bank', 'initial_loan_amount' => 0, 'current_balance' => 0]);
    $account = Account::create(['name' => 'Bank', 'opening_balance' => 1000, 'current_balance' => 1000]);

    $this->actingAs($user)->post(route('company-loans.transactions.store', $loan), [
        'transaction_type' => 'loan',
        'account_id' => $account->id,
        'amount' => 50000,
        'date' => now()->format('Y-m-d'),
    ])->assertSessionHasNoErrors();

    expect((float) $loan->fresh()->current_balance)->toBe(50000.0);
    expect((float) $account->fresh()->current_balance)->toBe(51000.0);

    $this->assertDatabaseHas('account_transactions', [
        'account_id' => $account->id,
        'type' => 'credit',
        'amount' => 50000,
    ]);
});

test('a repay transaction decreases the loan balance and debits the payment account', function () {
    $user = User::factory()->admin()->create();
    $loan = CompanyLoan::create(['lender_name' => 'ABC Bank', 'initial_loan_amount' => 50000, 'current_balance' => 50000]);
    $account = Account::create(['name' => 'Bank', 'opening_balance' => 10000, 'current_balance' => 10000]);

    $this->actingAs($user)->post(route('company-loans.transactions.store', $loan), [
        'transaction_type' => 'repay',
        'account_id' => $account->id,
        'amount' => 5000,
        'date' => now()->format('Y-m-d'),
    ])->assertSessionHasNoErrors();

    expect((float) $loan->fresh()->current_balance)->toBe(45000.0);
    expect((float) $account->fresh()->current_balance)->toBe(5000.0);

    $this->assertDatabaseHas('account_transactions', [
        'account_id' => $account->id,
        'type' => 'debit',
        'amount' => 5000,
    ]);
});

test('an interest transaction increases the loan balance without touching any account', function () {
    $user = User::factory()->admin()->create();
    $loan = CompanyLoan::create(['lender_name' => 'ABC Bank', 'initial_loan_amount' => 50000, 'current_balance' => 50000]);

    $this->actingAs($user)->post(route('company-loans.transactions.store', $loan), [
        'transaction_type' => 'interest',
        'amount' => 750,
        'date' => now()->format('Y-m-d'),
    ])->assertSessionHasNoErrors();

    expect((float) $loan->fresh()->current_balance)->toBe(50750.0);

    $this->assertDatabaseHas('company_loan_transactions', [
        'company_loan_id' => $loan->id,
        'transaction_type' => 'interest',
        'amount' => 750,
        'account_id' => null,
    ]);
    expect(AccountTransaction::count())->toBe(0);
});

test('a repay larger than the loan\'s outstanding balance is rejected', function () {
    $user = User::factory()->admin()->create();
    $loan = CompanyLoan::create(['lender_name' => 'ABC Bank', 'initial_loan_amount' => 3000, 'current_balance' => 3000]);
    $account = Account::create(['name' => 'Bank', 'opening_balance' => 10000, 'current_balance' => 10000]);

    $response = $this->actingAs($user)->post(route('company-loans.transactions.store', $loan), [
        'transaction_type' => 'repay',
        'account_id' => $account->id,
        'amount' => 5000,
        'date' => now()->format('Y-m-d'),
    ]);

    $response->assertSessionHas('error');
    expect((float) $loan->fresh()->current_balance)->toBe(3000.0);
    expect((float) $account->fresh()->current_balance)->toBe(10000.0);
    expect(CompanyLoanTransaction::count())->toBe(0);
});

test('loan and repay transactions require a payment account', function () {
    $user = User::factory()->admin()->create();
    $loan = CompanyLoan::create(['lender_name' => 'ABC Bank', 'initial_loan_amount' => 0, 'current_balance' => 0]);

    $this->actingAs($user)->post(route('company-loans.transactions.store', $loan), [
        'transaction_type' => 'loan',
        'amount' => 1000,
        'date' => now()->format('Y-m-d'),
    ])->assertSessionHasErrors('account_id');
});

test('the company loan show page lists its paginated transactions', function () {
    $user = User::factory()->admin()->create();
    $loan = CompanyLoan::create(['lender_name' => 'ABC Bank', 'initial_loan_amount' => 1000, 'current_balance' => 1000]);
    CompanyLoanTransaction::create([
        'company_loan_id' => $loan->id,
        'transaction_type' => 'interest',
        'amount' => 50,
        'date' => now()->format('Y-m-d'),
    ]);

    $response = $this->actingAs($user)->get(route('company-loans.show', $loan));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('company-loans/show')
        ->where('companyLoan.id', $loan->id)
        ->has('transactions.data', 1)
    );
});

test('the company loan show page running balance reflects full history even when narrowed by a date filter', function () {
    // Regression guard for the LedgerQuery::paginate() extraction (P1.3): the running-balance
    // window function must run over the loan's entire history before the date filter is applied,
    // not after.
    $user = User::factory()->admin()->create();
    $loan = CompanyLoan::create(['lender_name' => 'ABC Bank', 'initial_loan_amount' => 0, 'current_balance' => 0]);
    $account = Account::create(['name' => 'Bank', 'opening_balance' => 10000, 'current_balance' => 10000]);

    CompanyLoanTransaction::create([
        'company_loan_id' => $loan->id, 'account_id' => $account->id,
        'transaction_type' => 'loan', 'amount' => 1000, 'date' => now()->subDays(10)->toDateString(),
    ]);
    CompanyLoanTransaction::create([
        'company_loan_id' => $loan->id, 'account_id' => null,
        'transaction_type' => 'interest', 'amount' => 50, 'date' => now()->subDays(5)->toDateString(),
    ]);
    // Deliberately dated today — this is the only row the "today" filter should show.
    CompanyLoanTransaction::create([
        'company_loan_id' => $loan->id, 'account_id' => $account->id,
        'transaction_type' => 'repay', 'amount' => 200, 'date' => now()->toDateString(),
    ]);

    $response = $this->actingAs($user)->get(route('company-loans.show', $loan).'?date_filter=today');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->has('transactions.data', 1)
        ->where('transactions.data.0.running_balance', fn ($value) => (float) $value === 850.0) // 0 + 1000 + 50 - 200
    );
});
