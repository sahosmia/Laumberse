<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Same safe nullable → backfill strategy as investor_transactions.outlet_id (see the sibling
 * migration). CompanyLoan (the lender) stays GLOBAL — only each cash-moving transaction is
 * outlet-scoped, including the opening-amount row (a loan's starting balance still belongs to
 * some outlet, same reasoning as Investor's opening-balance row).
 *
 * Unlike Investor, CompanyLoanService::createLoan() never wrote a ledger row for
 * `initial_loan_amount` — the app code is being fixed alongside this migration to always record
 * one. Existing loans predate that fix, so their initial amount would otherwise be invisible from
 * every outlet-specific Financial Position (while still counting toward the All-Outlets total via
 * the untouched `current_balance` column) — backfilled here with the same synthetic opening row
 * the code now creates for new loans, attributed to the default outlet like every other row.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('company_loan_transactions', function (Blueprint $table) {
            $table->foreignId('outlet_id')->nullable()->after('id')->constrained()->restrictOnDelete();
        });

        $defaultOutletId = DB::table('outlets')->where('code', 'MAIN')->value('id');

        if ($defaultOutletId) {
            DB::table('company_loan_transactions')->whereNull('outlet_id')->update(['outlet_id' => $defaultOutletId]);
        }

        $now = now();

        foreach (DB::table('company_loans')->where('initial_loan_amount', '>', 0)->get(['id', 'initial_loan_amount', 'created_at']) as $loan) {
            DB::table('company_loan_transactions')->insert([
                'company_loan_id' => $loan->id,
                'account_id' => null,
                'outlet_id' => $defaultOutletId,
                'transaction_type' => 'loan',
                'amount' => $loan->initial_loan_amount,
                'date' => $loan->created_at,
                'note' => 'Opening loan amount',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    public function down(): void
    {
        DB::table('company_loan_transactions')->where('note', 'Opening loan amount')->whereNull('account_id')->delete();

        Schema::table('company_loan_transactions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('outlet_id');
        });
    }
};
