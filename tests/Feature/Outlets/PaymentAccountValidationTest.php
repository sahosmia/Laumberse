<?php

use App\Models\Account;
use App\Models\Category;
use App\Models\Client;
use App\Models\CompanyLoan;
use App\Models\CompanyLoanTransaction;
use App\Models\ExpenseCategory;
use App\Models\Investor;
use App\Models\InvestorTransaction;
use App\Models\Outlet;
use App\Models\Product;
use App\Models\User;

/**
 * Regression coverage for the account_id/outlet_id cross-check added to StoreExpenseRequest,
 * StoreInvoiceRequest, StoreInvestorTransactionRequest, and StoreCompanyLoanTransactionRequest —
 * previously any authenticated user could submit any account_id system-wide regardless of the
 * active outlet (confirmed live: a real "Business Transportation" expense ended up paid from an
 * account belonging to a different outlet than the expense itself, invisible from that outlet's
 * Financial Position). AccountTransferController already guarded this itself and needs no request
 * rule (see its own same-outlet check), so it isn't covered here.
 */
test('an expense cannot be paid from another outlet\'s account', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Accountant');

    $accountB = Account::create(['outlet_id' => $outletB->id, 'name' => 'Bank B', 'opening_balance' => 0, 'current_balance' => 0]);
    $category = ExpenseCategory::create(['name' => 'Cat', 'description' => 'General']);

    $response = test()->actingAs($userA)->post(route('expenses.store'), [
        'expense_category_id' => $category->id,
        'account_id' => $accountB->id,
        'amount' => 150,
        'date' => now()->format('Y-m-d'),
    ]);

    $response->assertSessionHasErrors(['account_id']);
});

test('an invoice cannot be paid from another outlet\'s account', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Manager');

    $accountB = Account::create(['outlet_id' => $outletB->id, 'name' => 'Bank B', 'opening_balance' => 0, 'current_balance' => 0]);
    $category = Category::create(['name' => 'Cat-'.uniqid(), 'slug' => 'cat-'.uniqid()]);
    $product = Product::create(['name' => 'Prod', 'category_id' => $category->id, 'price' => 100]);
    $client = Client::create(['name' => 'Client', 'phone' => '01700000000']);

    $response = test()->actingAs($userA)->post(route('invoices.store'), [
        'date' => now()->format('Y-m-d'),
        'client_id' => $client->id,
        'create_new_client' => false,
        'total' => 100,
        'paid' => 100,
        'due' => 0,
        'status' => 'Processing',
        'account_id' => $accountB->id,
        'discount_type' => 'Fixed',
        'discount_amount' => 0,
        'items' => [['productId' => $product->id, 'qty' => 1, 'price' => 100]],
    ]);

    $response->assertSessionHasErrors(['account_id']);
});

test('an investor transaction cannot use another outlet\'s account', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Accountant');

    $investor = Investor::create(['name' => 'Jane', 'opening_balance' => 0, 'current_balance' => 0]);
    $accountB = Account::create(['outlet_id' => $outletB->id, 'name' => 'Bank B', 'opening_balance' => 0, 'current_balance' => 0]);

    $response = test()->actingAs($userA)->post(route('investors.transactions.store', $investor), [
        'transaction_type' => 'invest',
        'account_id' => $accountB->id,
        'amount' => 5000,
        'date' => now()->format('Y-m-d'),
    ]);

    $response->assertSessionHasErrors(['account_id']);
});

test('a company loan transaction cannot use another outlet\'s account', function () {
    $outletB = Outlet::factory()->create();
    $userA = User::factory()->create();
    $userA->assignRole('Accountant');

    $loan = CompanyLoan::create(['lender_name' => 'ABC Bank', 'initial_loan_amount' => 0, 'current_balance' => 0]);
    $accountB = Account::create(['outlet_id' => $outletB->id, 'name' => 'Bank B', 'opening_balance' => 0, 'current_balance' => 0]);

    $response = test()->actingAs($userA)->post(route('company-loans.transactions.store', $loan), [
        'transaction_type' => 'loan',
        'account_id' => $accountB->id,
        'amount' => 5000,
        'date' => now()->format('Y-m-d'),
    ]);

    $response->assertSessionHasErrors(['account_id']);
});

test('an investor transaction is recorded against the creator\'s own outlet', function () {
    $userA = User::factory()->create();
    $userA->assignRole('Accountant');

    $investor = Investor::create(['name' => 'Jane', 'opening_balance' => 0, 'current_balance' => 0]);
    $account = Account::create(['outlet_id' => $userA->outlet_id, 'name' => 'Bank', 'opening_balance' => 0, 'current_balance' => 0]);

    test()->actingAs($userA)->post(route('investors.transactions.store', $investor), [
        'transaction_type' => 'invest',
        'account_id' => $account->id,
        'amount' => 5000,
        'date' => now()->format('Y-m-d'),
    ])->assertSessionHasNoErrors();

    $transaction = InvestorTransaction::latest('id')->first();
    expect($transaction->outlet_id)->toBe($userA->outlet_id);
});

test('a company loan transaction is recorded against the creator\'s own outlet', function () {
    $userA = User::factory()->create();
    $userA->assignRole('Accountant');

    $loan = CompanyLoan::create(['lender_name' => 'ABC Bank', 'initial_loan_amount' => 0, 'current_balance' => 0]);
    $account = Account::create(['outlet_id' => $userA->outlet_id, 'name' => 'Bank', 'opening_balance' => 0, 'current_balance' => 0]);

    test()->actingAs($userA)->post(route('company-loans.transactions.store', $loan), [
        'transaction_type' => 'loan',
        'account_id' => $account->id,
        'amount' => 5000,
        'date' => now()->format('Y-m-d'),
    ])->assertSessionHasNoErrors();

    $transaction = CompanyLoanTransaction::latest('id')->first();
    expect($transaction->outlet_id)->toBe($userA->outlet_id);
});
