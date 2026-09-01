<?php

use App\Enums\AssetStatus;
use App\Models\Account;
use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\Client;
use App\Models\CompanyLoan;
use App\Models\Employee;
use App\Models\Investor;
use App\Models\Invoice;
use App\Models\User;
use App\Services\AccountService;
use Inertia\Testing\AssertableInertia as Assert;

// Coverage for GetFinancialPositionAction's redesigned Capital/Gross Profit split: Capital now
// comes from the independent Investor ledger (sum of current_balance) instead of being the
// balancing figure; Gross Profit is the balancing figure instead. None of this had any test
// before — the whole action was previously exercised only by manual inspection.

test('capital equals the sum of every investor\'s current_balance, with a per-investor breakdown', function () {
    // "All Outlets" explicitly, since Capital is now computed per-outlet from InvestorTransaction
    // rows while a single outlet is active (see GetFinancialPositionAction) — these Investor rows
    // are seeded directly with no transactions, so only the All-Outlets view (still backed by the
    // flat current_balance column) reflects them.
    $user = User::factory()->admin()->create();
    $this->actingAs($user)->post(route('outlet-context.update'), ['outlet' => 'all'])->assertRedirect();
    Investor::create(['name' => 'Jane', 'opening_balance' => 5000, 'current_balance' => 5000]);
    Investor::create(['name' => 'John', 'opening_balance' => 0, 'current_balance' => 3000]);

    $response = $this->actingAs($user)->get(route('accounts.financial-position'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->where('liabilities.capital.total', 8000)
        ->has('liabilities.capital.items', 2)
    );
});

test('an investor with a zero balance still appears in the capital breakdown', function () {
    $user = User::factory()->admin()->create();
    $this->actingAs($user)->post(route('outlet-context.update'), ['outlet' => 'all'])->assertRedirect();
    Investor::create(['name' => 'No Balance', 'opening_balance' => 0, 'current_balance' => 0]);

    $response = $this->actingAs($user)->get(route('accounts.financial-position'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->where('liabilities.capital.total', 0)
        ->has('liabilities.capital.items', 1)
    );
});

test('total assets always equals total liability, with gross profit as the balancing figure', function () {
    $user = User::factory()->admin()->create();
    $this->actingAs($user)->post(route('outlet-context.update'), ['outlet' => 'all'])->assertRedirect();
    Investor::create(['name' => 'Jane', 'opening_balance' => 5000, 'current_balance' => 5000]);
    CompanyLoan::create(['lender_name' => 'Bank', 'initial_loan_amount' => 2000, 'current_balance' => 2000]);
    Account::create(['name' => 'Cash', 'opening_balance' => 10000, 'current_balance' => 10000]);
    // Sundry Debtors is now computed from real outlet-scoped Invoice.due rows, not the global
    // Client.total_due column (see GetFinancialPositionAction) — so the fixture needs an actual
    // invoice, not just a total_due value set directly on the client.
    // Delivered, since a not-yet-delivered order isn't a firm receivable (see GetFinancialPositionAction).
    $debtor = Client::create(['name' => 'Debtor', 'phone' => '01700000000']);
    Invoice::create([
        'invoice_uuid' => 'INV-DEBTOR-1', 'date' => now()->toDateString(), 'client_id' => $debtor->id,
        'total' => 1500, 'paid' => 0, 'due' => 1500, 'status' => 'Delivered', 'method' => 'Cash',
    ]);
    Employee::create(['name' => 'Staff', 'phone' => '01700000001', 'designation' => 'Staff', 'base_salary' => 10000, 'opening_balance' => 500]);

    $response = $this->actingAs($user)->get(route('accounts.financial-position'));

    // Total Assets = 10000 (cash) + 1500 (debtor) + 500 (staff advance) + 0 (no other assets) = 12000.
    // Gross Profit = Total Assets − (Capital 5000 + Company Loan 2000) = 5000 — the balancing figure.
    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->where('assets.cash_at_bank.total', 10000)
        ->where('assets.sundry_debtors.total', 1500)
        ->where('assets.staff_advances.total', 500)
        ->where('assets.total', 12000)
        ->where('liabilities.capital.total', 5000)
        ->where('liabilities.company_loan.total', 2000)
        ->where('liabilities.gross_profit', 5000)
        // The core identity this whole statement exists to prove.
        ->where('liabilities.total', 12000)
    );
});

test('a disposed asset does not count toward other assets', function () {
    $user = User::factory()->admin()->create();
    $category = AssetCategory::create(['name' => 'Machinery', 'description' => 'd']);
    Asset::create([
        'name' => 'Active Machine', 'purchase_date' => now()->toDateString(), 'cost' => 1000,
        'status' => AssetStatus::Active->value, 'asset_category_id' => $category->id,
    ]);
    Asset::create([
        'name' => 'Disposed Machine', 'purchase_date' => now()->toDateString(), 'cost' => 2000,
        'status' => AssetStatus::Disposed->value, 'asset_category_id' => $category->id,
    ]);

    $response = $this->actingAs($user)->get(route('accounts.financial-position'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->where('assets.other_assets.total', 1000)
        ->has('assets.other_assets.items', 1)
    );
});

test('with no as_of_date param the response is identical to the live view', function () {
    $user = User::factory()->admin()->create();
    Account::create(['name' => 'Cash', 'opening_balance' => 10000, 'current_balance' => 10000]);

    $response = $this->actingAs($user)->get(route('accounts.financial-position'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->where('as_of_date', null)
        ->where('assets.cash_at_bank.total', 10000)
    );
});

test('an invalid as_of_date value is rejected', function () {
    $user = User::factory()->admin()->create();

    $response = $this->actingAs($user)->get(route('accounts.financial-position', ['as_of_date' => 'not-a-date']));

    $response->assertSessionHasErrors(['as_of_date']);
});

test('cash at bank as_of_date excludes transactions dated after that date', function () {
    $user = User::factory()->admin()->create();
    $account = Account::create(['outlet_id' => $user->outlet_id, 'name' => 'Cash', 'opening_balance' => 1000, 'current_balance' => 1000]);
    app(AccountService::class)->recordTransaction($account, 'credit', 500, 'before', null);

    $asOfBefore = $this->actingAs($user)->get(route('accounts.financial-position', ['as_of_date' => now()->subDay()->toDateString()]));
    $asOfBefore->assertInertia(fn (Assert $page) => $page->where('assets.cash_at_bank.total', 1000));

    $asOfToday = $this->actingAs($user)->get(route('accounts.financial-position', ['as_of_date' => now()->toDateString()]));
    $asOfToday->assertInertia(fn (Assert $page) => $page->where('assets.cash_at_bank.total', 1500));
});

test('an account with no transactions before as_of_date still appears at its opening balance', function () {
    $user = User::factory()->admin()->create();
    Account::create(['outlet_id' => $user->outlet_id, 'name' => 'Untouched', 'opening_balance' => 777, 'current_balance' => 777]);

    $response = $this->actingAs($user)->get(route('accounts.financial-position', ['as_of_date' => now()->toDateString()]));

    $response->assertInertia(fn (Assert $page) => $page
        ->where('assets.cash_at_bank.total', 777)
        ->has('assets.cash_at_bank.items', 1)
    );
});

test('sundry debtors and other assets stay current regardless of as_of_date', function () {
    $user = User::factory()->admin()->create();
    $category = AssetCategory::create(['name' => 'Machinery', 'description' => 'd']);
    Asset::create([
        'outlet_id' => $user->outlet_id, 'name' => 'Machine', 'purchase_date' => now()->toDateString(), 'cost' => 5000,
        'status' => AssetStatus::Active->value, 'asset_category_id' => $category->id,
    ]);
    $debtor = Client::create(['name' => 'Debtor', 'phone' => '01700000005']);
    Invoice::create([
        'outlet_id' => $user->outlet_id, 'invoice_uuid' => 'INV-DEBTOR-2', 'date' => now()->toDateString(), 'client_id' => $debtor->id,
        'total' => 900, 'paid' => 0, 'due' => 900, 'status' => 'Delivered', 'method' => 'Cash',
    ]);

    $live = $this->actingAs($user)->get(route('accounts.financial-position'));
    $asOfLongAgo = $this->actingAs($user)->get(route('accounts.financial-position', ['as_of_date' => '2020-01-01']));

    // A "2020-01-01" filter would exclude an invoice/asset dated today if either were date-scoped
    // — they aren't, so both requests see identical Debtors/Other-Assets figures.
    $live->assertInertia(fn (Assert $page) => $page->where('assets.sundry_debtors.total', 900)->where('assets.other_assets.total', 5000));
    $asOfLongAgo->assertInertia(fn (Assert $page) => $page->where('assets.sundry_debtors.total', 900)->where('assets.other_assets.total', 5000));
});
