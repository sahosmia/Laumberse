<?php

use App\Models\CompanyLoan;
use App\Models\CompanyLoanTransaction;
use App\Models\Investor;
use App\Models\InvestorTransaction;
use App\Models\Outlet;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

/**
 * Coverage for GetFinancialPositionAction's Capital/Company Loan split: while a single outlet is
 * active, both figures are computed from that outlet's own InvestorTransaction/
 * CompanyLoanTransaction rows (invest/loan minus withdraw/repay), never the flat current_balance
 * column — using the flat column here would either leak another outlet's capital into this one,
 * or double count once summed across outlets. "All Outlets" keeps using the flat column, which
 * already holds the correct company-wide total.
 */
test('capital for a single outlet only sums that outlet\'s own investor transactions', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Accountant');

    // The flat current_balance is deliberately a company-wide figure unrelated to either outlet's
    // own transactions — proves the single-outlet view doesn't fall back to it.
    $investor = Investor::create(['name' => 'Jane', 'opening_balance' => 0, 'current_balance' => 99999]);
    InvestorTransaction::create([
        'investor_id' => $investor->id, 'outlet_id' => $userA->outlet_id,
        'transaction_type' => 'invest', 'amount' => 10000, 'date' => now()->toDateString(),
    ]);
    InvestorTransaction::create([
        'investor_id' => $investor->id, 'outlet_id' => $outletB->id,
        'transaction_type' => 'invest', 'amount' => 40000, 'date' => now()->toDateString(),
    ]);

    $response = test()->actingAs($userA)->get(route('accounts.financial-position'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->where('liabilities.capital.total', 10000)
        ->has('liabilities.capital.items', 1)
    );
});

test('company loan for a single outlet only sums that outlet\'s own loan transactions', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Accountant');

    $loan = CompanyLoan::create(['lender_name' => 'ABC Bank', 'initial_loan_amount' => 0, 'current_balance' => 99999]);
    CompanyLoanTransaction::create([
        'company_loan_id' => $loan->id, 'outlet_id' => $userA->outlet_id,
        'transaction_type' => 'loan', 'amount' => 20000, 'date' => now()->toDateString(),
    ]);
    CompanyLoanTransaction::create([
        'company_loan_id' => $loan->id, 'outlet_id' => $userA->outlet_id,
        'transaction_type' => 'repay', 'amount' => 5000, 'date' => now()->toDateString(),
    ]);
    CompanyLoanTransaction::create([
        'company_loan_id' => $loan->id, 'outlet_id' => $outletB->id,
        'transaction_type' => 'loan', 'amount' => 70000, 'date' => now()->toDateString(),
    ]);

    $response = test()->actingAs($userA)->get(route('accounts.financial-position'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->where('liabilities.company_loan.total', 15000) // 20000 - 5000, outlet B's 70000 excluded
        ->has('liabilities.company_loan.items', 1)
    );
});

test('capital for All Outlets uses the flat current_balance total, not a sum of per-outlet transactions', function () {
    $outletB = Outlet::factory()->create();
    $admin = User::factory()->admin()->create();

    $investor = Investor::create(['name' => 'Jane', 'opening_balance' => 0, 'current_balance' => 99999]);
    InvestorTransaction::create([
        'investor_id' => $investor->id, 'outlet_id' => $admin->outlet_id,
        'transaction_type' => 'invest', 'amount' => 1000, 'date' => now()->toDateString(),
    ]);
    InvestorTransaction::create([
        'investor_id' => $investor->id, 'outlet_id' => $outletB->id,
        'transaction_type' => 'invest', 'amount' => 2000, 'date' => now()->toDateString(),
    ]);

    test()->actingAs($admin)->post(route('outlet-context.update'), ['outlet' => 'all'])->assertRedirect();

    $response = test()->actingAs($admin)->get(route('accounts.financial-position'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page->where('liabilities.capital.total', 99999));
});

test('capital as_of_date combines with outlet scoping — only that outlet\'s transactions on or before the date', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Accountant');

    $investor = Investor::create(['name' => 'Jane', 'opening_balance' => 0, 'current_balance' => 99999]);
    InvestorTransaction::create([
        'investor_id' => $investor->id, 'outlet_id' => $userA->outlet_id,
        'transaction_type' => 'invest', 'amount' => 3000, 'date' => now()->subDays(10)->toDateString(),
    ]);
    InvestorTransaction::create([
        'investor_id' => $investor->id, 'outlet_id' => $userA->outlet_id,
        'transaction_type' => 'invest', 'amount' => 4000, 'date' => now()->toDateString(),
    ]);
    // Same-day transaction in a different outlet — must never leak into $userA's total either.
    InvestorTransaction::create([
        'investor_id' => $investor->id, 'outlet_id' => $outletB->id,
        'transaction_type' => 'invest', 'amount' => 9000, 'date' => now()->subDays(10)->toDateString(),
    ]);

    $response = test()->actingAs($userA)->get(route('accounts.financial-position', ['as_of_date' => now()->subDays(5)->toDateString()]));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page->where('liabilities.capital.total', 3000));
});

test('an investor with no transactions in the active outlet is excluded from that outlet\'s capital breakdown', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Accountant');

    $investor = Investor::create(['name' => 'Outlet B Only', 'opening_balance' => 0, 'current_balance' => 5000]);
    InvestorTransaction::create([
        'investor_id' => $investor->id, 'outlet_id' => $outletB->id,
        'transaction_type' => 'invest', 'amount' => 5000, 'date' => now()->toDateString(),
    ]);

    $response = test()->actingAs($userA)->get(route('accounts.financial-position'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->where('liabilities.capital.total', 0)
        ->has('liabilities.capital.items', 0)
    );
});
