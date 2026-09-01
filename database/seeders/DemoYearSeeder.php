<?php

namespace Database\Seeders;

use App\Enums\AssetStatus;
use App\Models\Account;
use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\Client;
use App\Models\CompanyLoan;
use App\Models\CompanyLoanTransaction;
use App\Models\Employee;
use App\Models\EmployeeTransaction;
use App\Models\ExpenseCategory;
use App\Models\GlobalSetting;
use App\Models\Investor;
use App\Models\InvestorTransaction;
use App\Models\Material;
use App\Models\Product;
use App\Services\AccountService;
use App\Services\ClientActivityService;
use App\Services\CompanyLoanService;
use App\Services\EmployeeTransactionService;
use App\Services\ExpenseService;
use App\Services\InvestorService;
use App\Services\InvoiceService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Fills a ~13-month history (last year through today) of realistic, interlinked activity across
 * every ledger the app has — invoices, salary/material/general expenses, employee advances,
 * investor & company-loan transactions, account transfers, client meetings/follow-ups, and a
 * couple of extra asset purchases — so every date filter, "as of" report, and running-balance
 * ledger has real historical data to check against instead of just the single today-dated example
 * each base seeder creates.
 *
 * Goes entirely through the same service classes the app's controllers use (InvoiceService,
 * ExpenseService, EmployeeTransactionService, ...) so every side effect this produces — account
 * debits/credits, client stat increments, payroll status, insufficient-balance guards — is
 * identical to what a real user action would produce. The one thing a real request never has to
 * do, which this seeder does, is backdate `account_transactions` rows after creating them: that
 * table has no `date` column of its own, only `created_at`/`updated_at`, and that's what the
 * Account ledger sorts and filters by (see AccountController::show / DateRangeFilter). Every other
 * table involved (Invoice, Expense, EmployeeTransaction, InvestorTransaction,
 * CompanyLoanTransaction, ClientActivity, Asset) already has its own real `date`/`scheduled_at`/
 * `purchase_date` column, set correctly at creation time, so no backdating is needed there.
 */
class DemoYearSeeder extends Seeder
{
    private const SETTING_KEY = 'demo_year_seeded_at';

    private Carbon $start;

    private Carbon $end;

    private Collection $accounts;

    private Collection $activeEmployees;

    private Collection $clients;

    private Collection $products;

    private Collection $materials;

    private Collection $generalCategories;

    private ?Investor $investor;

    private ?CompanyLoan $loan;

    public function run(): void
    {
        if (GlobalSetting::get(self::SETTING_KEY)) {
            $this->command?->info('DemoYearSeeder already ran — skipping. Delete the "'.self::SETTING_KEY.'" row from global_settings to re-run it.');

            return;
        }

        $this->start = Carbon::now()->subMonths(12)->startOfMonth();
        $this->end = Carbon::now();

        $this->accounts = Account::orderBy('name')->get();
        $this->activeEmployees = Employee::where('is_active', true)->get();
        $this->clients = Client::all();
        $this->products = Product::all();
        $this->materials = Material::all();
        $this->investor = Investor::first();
        $this->loan = CompanyLoan::first();

        if ($this->accounts->isEmpty() || $this->clients->isEmpty() || $this->products->isEmpty()
            || $this->activeEmployees->isEmpty() || ! $this->investor || ! $this->loan) {
            $this->command?->warn('DemoYearSeeder skipped: run the base seeders first (accounts, clients, products, employees, investors, company loans).');

            return;
        }

        $this->generalCategories = collect([
            ExpenseCategory::firstOrCreate(['name' => 'Utility Bills'], ['description' => 'Electricity, water, gas, internet']),
            ExpenseCategory::firstOrCreate(['name' => 'Rent'], ['description' => 'Shop / warehouse rent']),
            ExpenseCategory::firstOrCreate(['name' => 'Miscellaneous'], ['description' => 'Small day-to-day running costs']),
            ExpenseCategory::find(GlobalSetting::get('business_transportation_category_id')),
            ExpenseCategory::find(GlobalSetting::get('delivery_transportation_category_id')),
        ])->filter()->values();

        $this->backdateBaselineRows();

        $cursor = $this->start->copy();
        while ($cursor->lte($this->end)) {
            $this->seedMonth($cursor->copy());
            $cursor->addMonth();
        }

        $this->seedExtraAssetPurchases();

        GlobalSetting::set(self::SETTING_KEY, now()->toDateTimeString());
        $this->command?->info('DemoYearSeeder: seeded ~13 months of demo activity across every ledger.');
    }

    /**
     * Push the single "today"-dated rows the base seeders already created back to the start of
     * the window, so the year opens with real opening capital instead of an empty ledger — and
     * doesn't show a whole year of history dated after its own "initial investment" row.
     */
    private function backdateBaselineRows(): void
    {
        $day = $this->start->copy()->addDay();

        foreach ($this->accounts as $account) {
            $this->backdateAccountTransactionsFor($account, $day); // opening balance row
        }

        EmployeeTransaction::query()->each(function (EmployeeTransaction $t) use ($day) {
            $t->forceFill(['date' => $day->toDateString()])->save();
            $this->backdateAccountTransactionsFor($t, $day);
        });

        InvestorTransaction::query()->each(function (InvestorTransaction $t) use ($day) {
            $t->forceFill(['date' => $day->toDateString()])->save();
            $this->backdateAccountTransactionsFor($t, $day);
        });

        CompanyLoanTransaction::query()->each(function (CompanyLoanTransaction $t) use ($day) {
            $t->forceFill(['date' => $day->toDateString()])->save();
            $this->backdateAccountTransactionsFor($t, $day);
        });
    }

    private function backdateAccountTransactionsFor(Model $reference, Carbon $date): void
    {
        DB::table('account_transactions')
            ->where('reference_type', $reference::class)
            ->where('reference_id', $reference->id)
            ->update(['created_at' => $date, 'updated_at' => $date]);
    }

    private function seedMonth(Carbon $monthStart): void
    {
        $monthEnd = $monthStart->copy()->endOfMonth();
        if ($monthEnd->gt($this->end)) {
            $monthEnd = $this->end->copy();
        }

        // Income first, so the balance checks later in the month have something to draw against.
        foreach (range(1, rand(16, 26)) as $_) {
            $this->seedInvoice($this->randomDateIn($monthStart, $monthEnd));
        }

        foreach ($this->activeEmployees as $employee) {
            $this->seedSalary($employee, $monthStart, $this->randomDateIn($monthStart, $monthEnd));
        }

        foreach (range(1, rand(2, 4)) as $_) {
            $this->seedGeneralExpense($this->randomDateIn($monthStart, $monthEnd));
        }

        if (rand(1, 100) <= 80) {
            $this->seedMaterialPurchase($this->randomDateIn($monthStart, $monthEnd));
        }

        if (rand(1, 100) <= 45) {
            $this->seedEmployeeTransaction($this->randomDateIn($monthStart, $monthEnd));
        }

        $this->seedCompanyLoanActivity($monthStart, $this->randomDateIn($monthStart, $monthEnd));

        if ($monthStart->month % 3 === 0) {
            $this->seedScheduledInvestorTopUp($this->randomDateIn($monthStart, $monthEnd));
        }

        $this->maybeSeedInvestorWithdrawal($this->randomDateIn($monthStart, $monthEnd));

        $this->seedAccountTransfer($this->randomDateIn($monthStart, $monthEnd));

        if (rand(1, 100) <= 70) {
            $this->seedClientActivity($this->randomDateIn($monthStart, $monthEnd));
        }
    }

    private function randomDateIn(Carbon $monthStart, Carbon $monthEnd): Carbon
    {
        $startTs = $monthStart->copy()->startOfDay()->timestamp;
        $endTs = min($monthEnd->copy()->endOfDay()->timestamp, $this->end->timestamp);

        if ($endTs <= $startTs) {
            return $monthStart->copy();
        }

        return Carbon::createFromTimestamp(rand($startTs, $endTs));
    }

    private function seedInvoice(Carbon $date): void
    {
        $client = $this->clients->random();
        $account = $this->accounts->random();

        $itemCount = rand(1, min(4, $this->products->count()));
        $selected = $this->products->random($itemCount);
        $selected = $selected instanceof Collection ? $selected : collect([$selected]);

        $items = [];
        $total = 0;
        foreach ($selected as $product) {
            $qty = rand(8, 30); // bulk laundry orders
            $price = (float) $product->price;
            $total += $qty * $price;
            $items[] = ['productId' => $product->id, 'qty' => $qty, 'price' => $price];
        }

        $fullyPaid = rand(1, 100) <= 75;
        $paid = $fullyPaid ? $total : round($total * (rand(30, 70) / 100), 2);
        $due = round($total - $paid, 2);

        $isRecent = $date->gt($this->end->copy()->subDays(10));
        $status = $isRecent ? collect(['Processing', 'In House', 'Delivered'])->random() : 'Delivered';

        $invoice = app(InvoiceService::class)->createInvoice([
            'date' => $date->toDateString(),
            'client_id' => $client->id,
            'account_id' => $paid > 0 ? $account->id : null,
            'items' => $items,
            'total' => $total,
            'paid' => $paid,
            'due' => $due,
            'status' => $status,
            'discount_type' => 'Fixed',
            'discount_amount' => 0,
            'delivery_charge' => 0,
        ]);

        if ($paid > 0) {
            $this->backdateAccountTransactionsFor($invoice, $date);
        }
    }

    private function seedSalary(Employee $employee, Carbon $monthStart, Carbon $date): void
    {
        $account = $this->accounts->firstWhere('name', 'Bank') ?? $this->accounts->first();

        // A modest bonus around Eid-ish months, most of the time.
        $bonus = (in_array($monthStart->month, [4, 10]) && rand(1, 100) <= 60)
            ? round($employee->base_salary * 0.1, 2)
            : 0;
        $amount = round($employee->base_salary + $bonus, 2);

        $this->ensureFunds($account, $amount, $date);

        $expense = app(ExpenseService::class)->storeExpense([
            'expense_category_id' => GlobalSetting::get('salary_category_id'),
            'employee_id' => $employee->id,
            'month' => $monthStart->month,
            'year' => $monthStart->year,
            'bonus' => $bonus,
            'deduction' => 0,
            'account_id' => $account->id,
            'amount' => $amount,
            'date' => $date->toDateString(),
            'description' => "Salary - {$employee->name} ({$monthStart->format('M Y')})",
        ]);

        $this->backdateAccountTransactionsFor($expense, $date);
    }

    private function seedGeneralExpense(Carbon $date): void
    {
        $category = $this->generalCategories->random();
        $account = $this->accounts->random();
        $amount = round(rand(500, 8000) + (rand(0, 99) / 100), 2);

        $this->ensureFunds($account, $amount, $date);

        $descriptions = [
            'Utility Bills' => 'Monthly electricity & water bill',
            'Rent' => 'Shop rent payment',
            'Miscellaneous' => 'Misc running costs',
        ];

        $expense = app(ExpenseService::class)->storeExpense([
            'expense_category_id' => $category->id,
            'account_id' => $account->id,
            'amount' => $amount,
            'date' => $date->toDateString(),
            'description' => $descriptions[$category->name] ?? "{$category->name} expense",
        ]);

        $this->backdateAccountTransactionsFor($expense, $date);
    }

    private function seedMaterialPurchase(Carbon $date): void
    {
        $account = $this->accounts->random();

        $itemCount = rand(1, min(3, $this->materials->count()));
        $selected = $this->materials->random($itemCount);
        $selected = $selected instanceof Collection ? $selected : collect([$selected]);

        $items = [];
        $total = 0;
        foreach ($selected as $material) {
            $qty = rand(5, 40);
            $price = round(rand(20, 200) + (rand(0, 99) / 100), 2);
            $total += round($qty * $price, 2);
            $items[] = ['material_id' => $material->id, 'quantity' => $qty, 'unit_price' => $price];
        }

        $this->ensureFunds($account, $total, $date);

        $expense = app(ExpenseService::class)->storeExpense([
            'expense_category_id' => GlobalSetting::get('material_expense_category_id'),
            'account_id' => $account->id,
            'amount' => $total,
            'date' => $date->toDateString(),
            'description' => 'Material purchase',
            'items' => $items,
        ]);

        $this->backdateAccountTransactionsFor($expense, $date);
    }

    private function seedEmployeeTransaction(Carbon $date): void
    {
        $employee = $this->activeEmployees->random()->fresh();
        $account = $this->accounts->random();

        $canReturn = $employee->current_balance > 500;
        $type = ($canReturn && rand(1, 100) <= 40) ? 'loan_return' : (rand(1, 100) <= 60 ? 'advance' : 'loan');

        $amount = $type === 'loan_return'
            ? round(min($employee->current_balance, rand(500, 5000)), 2)
            : round(rand(1000, 8000), 2);

        if ($type !== 'loan_return') {
            $this->ensureFunds($account, $amount, $date);
        }

        $transaction = app(EmployeeTransactionService::class)->addTransaction($employee, [
            'transaction_type' => $type,
            'account_id' => $account->id,
            'amount' => $amount,
            'date' => $date->toDateString(),
            'note' => ucfirst(str_replace('_', ' ', $type)).' - demo data',
        ]);

        $this->backdateAccountTransactionsFor($transaction, $date);
    }

    private function seedCompanyLoanActivity(Carbon $monthStart, Carbon $date): void
    {
        $this->loan->refresh();
        if ($this->loan->current_balance <= 0) {
            return;
        }

        $account = $this->accounts->firstWhere('name', 'Bank') ?? $this->accounts->first();

        // Occasional interest accrual — increases the loan balance but never touches an account.
        if ($monthStart->month % 4 === 0) {
            $interest = round($this->loan->current_balance * 0.01, 2);
            if ($interest > 0) {
                app(CompanyLoanService::class)->addTransaction($this->loan, [
                    'transaction_type' => 'interest',
                    'amount' => $interest,
                    'date' => $date->toDateString(),
                    'note' => 'Monthly interest accrual',
                ]);
            }
        }

        $this->loan->refresh();
        $installment = round(min($this->loan->current_balance, rand(3000, 7000)), 2);
        if ($installment <= 0) {
            return;
        }

        $this->ensureFunds($account, $installment, $date);

        $repay = app(CompanyLoanService::class)->addTransaction($this->loan, [
            'transaction_type' => 'repay',
            'account_id' => $account->id,
            'amount' => $installment,
            'date' => $date->toDateString(),
            'note' => 'Monthly installment',
        ]);

        $this->backdateAccountTransactionsFor($repay, $date);
    }

    private function seedScheduledInvestorTopUp(Carbon $date): void
    {
        $account = $this->accounts->firstWhere('name', 'Bank') ?? $this->accounts->first();
        $amount = round(rand(20000, 60000), 2);

        $tx = app(InvestorService::class)->addTransaction($this->investor, [
            'transaction_type' => 'invest',
            'account_id' => $account->id,
            'amount' => $amount,
            'date' => $date->toDateString(),
            'note' => 'Scheduled capital investment',
        ]);

        $this->backdateAccountTransactionsFor($tx, $date);
    }

    private function maybeSeedInvestorWithdrawal(Carbon $date): void
    {
        $this->investor->refresh();
        if ($this->investor->current_balance < 20000 || rand(1, 100) > 15) {
            return;
        }

        $account = $this->accounts->firstWhere('name', 'Bank') ?? $this->accounts->first();
        $account->refresh();
        $amount = round(min($this->investor->current_balance * 0.2, $account->current_balance * 0.3, 20000), 2);
        if ($amount < 500) {
            return;
        }

        $tx = app(InvestorService::class)->addTransaction($this->investor, [
            'transaction_type' => 'withdraw',
            'account_id' => $account->id,
            'amount' => $amount,
            'date' => $date->toDateString(),
            'note' => 'Partial profit withdrawal',
        ]);

        $this->backdateAccountTransactionsFor($tx, $date);
    }

    private function seedAccountTransfer(Carbon $date): void
    {
        $bank = $this->accounts->firstWhere('name', 'Bank');
        $cash = $this->accounts->firstWhere('name', 'Cash');
        if (! $bank || ! $cash || $bank->id === $cash->id) {
            return;
        }

        $amount = round(rand(5000, 15000), 2);
        $this->ensureFunds($bank, $amount, $date);

        $transfer = app(AccountService::class)->transferFunds($bank, $cash, $amount, $date->toDateString(), 'Cash replenishment');

        $this->backdateAccountTransactionsFor($transfer, $date);
    }

    private function seedClientActivity(Carbon $date): void
    {
        $client = $this->clients->random();
        $employee = $this->activeEmployees->isNotEmpty() ? $this->activeEmployees->random() : null;
        $isPast = $date->lt($this->end->copy()->subDays(7));

        $notes = [
            'Discussed monthly laundry contract renewal.',
            'Followed up on delayed pickup schedule.',
            'Client requested discount on bulk orders.',
            'Reviewed service quality feedback.',
            'Discussed new corporate package.',
        ];

        $data = [
            'type' => 'meeting',
            'employee_id' => $employee?->id,
            'scheduled_at' => $date->copy()->format('Y-m-d H:i:s'),
            'note' => $notes[array_rand($notes)],
            'status' => $isPast ? 'done' : 'pending',
        ];

        if (rand(1, 100) <= 55) {
            $data['next_follow_up_date'] = $date->copy()->addDays(rand(5, 21))->format('Y-m-d');
        }

        app(ClientActivityService::class)->logActivity($client, $data);
    }

    /**
     * Every debit in this seeder runs through the same balance-checked service methods a real
     * request would use, so a shortfall throws InsufficientBalanceException exactly like it would
     * in the app. Rather than hand-tune invoice revenue to always outpace 13 months of salary,
     * material, and loan-repayment demand, this tops the specific account up with an investor
     * capital injection whenever it's about to fall short — a believable "growing business needs
     * outside capital sometimes" story, and it's dated a few minutes before the debit it's covering
     * so the ledger reads income-before-expense.
     */
    private function ensureFunds(Account $account, float $amount, Carbon $date): void
    {
        $account->refresh();
        if ($account->current_balance >= $amount) {
            return;
        }

        $topUp = round(($amount - $account->current_balance) * 1.1, 2);

        $tx = app(InvestorService::class)->addTransaction($this->investor, [
            'transaction_type' => 'invest',
            'account_id' => $account->id,
            'amount' => $topUp,
            'date' => $date->toDateString(),
            'note' => 'Capital top-up to cover operating costs',
        ]);

        $this->backdateAccountTransactionsFor($tx, $date->copy()->subMinutes(rand(5, 60)));
    }

    private function seedExtraAssetPurchases(): void
    {
        $categoryId = GlobalSetting::get('asset_purchase_category_id');
        if (! $categoryId) {
            return;
        }

        $account = $this->accounts->firstWhere('name', 'Bank') ?? $this->accounts->first();
        $assetCategory = AssetCategory::inRandomOrder()->first();
        if (! $assetCategory) {
            return;
        }

        $extras = [
            ['name' => 'Delivery Motorbike', 'cost' => 180000, 'description' => 'Used for daily pickup & delivery', 'monthOffset' => 3],
            ['name' => 'Steam Iron Press', 'cost' => 35000, 'description' => 'Commercial steam press', 'monthOffset' => 8],
        ];

        foreach ($extras as $data) {
            if (Asset::where('name', $data['name'])->exists()) {
                continue;
            }

            $date = $this->start->copy()->addMonths($data['monthOffset'])->addDays(rand(1, 20));
            if ($date->gt($this->end)) {
                $date = $this->end->copy()->subDays(rand(1, 10));
            }

            $this->ensureFunds($account, $data['cost'], $date);

            $asset = Asset::create([
                'name' => $data['name'],
                'description' => $data['description'],
                'purchase_date' => $date->toDateString(),
                'cost' => $data['cost'],
                'status' => AssetStatus::Active->value,
                'asset_category_id' => $assetCategory->id,
            ]);

            $expense = app(ExpenseService::class)->storeExpense([
                'expense_category_id' => $categoryId,
                'asset_id' => $asset->id,
                'amount' => $data['cost'],
                'account_id' => $account->id,
                'date' => $date->toDateString(),
                'description' => "Purchase of asset: {$asset->name}",
            ]);

            $this->backdateAccountTransactionsFor($expense, $date);
        }
    }
}
