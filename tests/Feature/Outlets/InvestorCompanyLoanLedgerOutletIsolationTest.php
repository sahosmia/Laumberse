<?php

use App\Models\Account;
use App\Models\CompanyLoan;
use App\Models\CompanyLoanTransaction;
use App\Models\Investor;
use App\Models\InvestorTransaction;
use App\Models\Outlet;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

/**
 * Investor/CompanyLoan themselves are global entities, but their individual transactions carry
 * outlet_id (see GetFinancialPositionAction, which already scopes these same tables for the P&L
 * report). InvestorController::show()/CompanyLoanController::show() build their ledger with a raw
 * query, separate from that report's — this locks in that they scope it the same way.
 */
test('the investor show page only lists transactions from the current outlet', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Accountant');
    $account = Account::create(['outlet_id' => $userA->outlet_id, 'name' => 'Bank', 'opening_balance' => 0, 'current_balance' => 0]);

    $investor = Investor::create(['name' => 'Jane', 'opening_balance' => 0, 'current_balance' => 0]);
    InvestorTransaction::create([
        'investor_id' => $investor->id, 'account_id' => $account->id, 'outlet_id' => $userA->outlet_id,
        'transaction_type' => 'invest', 'amount' => 1000, 'date' => now()->toDateString(),
    ]);
    InvestorTransaction::create([
        'investor_id' => $investor->id, 'account_id' => null, 'outlet_id' => $outletB->id,
        'transaction_type' => 'invest', 'amount' => 9000, 'date' => now()->toDateString(),
    ]);

    $response = test()->actingAs($userA)->get(route('investors.show', $investor));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->has('transactions.data', 1)
        ->where('transactions.data.0.amount', fn ($value) => (float) $value === 1000.0)
    );
});

test('an admin viewing All Outlets sees an investor\'s transactions from every outlet', function () {
    $outletB = Outlet::factory()->create();
    $admin = User::factory()->admin()->create();

    $investor = Investor::create(['name' => 'Jane', 'opening_balance' => 0, 'current_balance' => 0]);
    InvestorTransaction::create([
        'investor_id' => $investor->id, 'account_id' => null, 'outlet_id' => $admin->outlet_id,
        'transaction_type' => 'invest', 'amount' => 1000, 'date' => now()->toDateString(),
    ]);
    InvestorTransaction::create([
        'investor_id' => $investor->id, 'account_id' => null, 'outlet_id' => $outletB->id,
        'transaction_type' => 'invest', 'amount' => 9000, 'date' => now()->toDateString(),
    ]);

    test()->actingAs($admin)->post(route('outlet-context.update'), ['outlet' => 'all'])->assertRedirect();

    $response = test()->actingAs($admin)->get(route('investors.show', $investor));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page->has('transactions.data', 2));
});

test('the company loan show page only lists transactions from the current outlet', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Accountant');
    $account = Account::create(['outlet_id' => $userA->outlet_id, 'name' => 'Bank', 'opening_balance' => 0, 'current_balance' => 0]);

    $loan = CompanyLoan::create(['lender_name' => 'ABC Bank', 'initial_loan_amount' => 0, 'current_balance' => 0]);
    CompanyLoanTransaction::create([
        'company_loan_id' => $loan->id, 'account_id' => $account->id, 'outlet_id' => $userA->outlet_id,
        'transaction_type' => 'loan', 'amount' => 1000, 'date' => now()->toDateString(),
    ]);
    CompanyLoanTransaction::create([
        'company_loan_id' => $loan->id, 'account_id' => null, 'outlet_id' => $outletB->id,
        'transaction_type' => 'loan', 'amount' => 9000, 'date' => now()->toDateString(),
    ]);

    $response = test()->actingAs($userA)->get(route('company-loans.show', $loan));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->has('transactions.data', 1)
        ->where('transactions.data.0.amount', fn ($value) => (float) $value === 1000.0)
    );
});

test('an admin viewing All Outlets sees a company loan\'s transactions from every outlet', function () {
    $outletB = Outlet::factory()->create();
    $admin = User::factory()->admin()->create();

    $loan = CompanyLoan::create(['lender_name' => 'ABC Bank', 'initial_loan_amount' => 0, 'current_balance' => 0]);
    CompanyLoanTransaction::create([
        'company_loan_id' => $loan->id, 'account_id' => null, 'outlet_id' => $admin->outlet_id,
        'transaction_type' => 'loan', 'amount' => 1000, 'date' => now()->toDateString(),
    ]);
    CompanyLoanTransaction::create([
        'company_loan_id' => $loan->id, 'account_id' => null, 'outlet_id' => $outletB->id,
        'transaction_type' => 'loan', 'amount' => 9000, 'date' => now()->toDateString(),
    ]);

    test()->actingAs($admin)->post(route('outlet-context.update'), ['outlet' => 'all'])->assertRedirect();

    $response = test()->actingAs($admin)->get(route('company-loans.show', $loan));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page->has('transactions.data', 2));
});
