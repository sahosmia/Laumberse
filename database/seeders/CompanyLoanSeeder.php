<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\CompanyLoan;
use App\Services\CompanyLoanService;
use Illuminate\Database\Seeder;

class CompanyLoanSeeder extends Seeder
{
    public function run(): void
    {
        if (CompanyLoan::where('lender_name', 'ABC Bank Ltd')->exists()) {
            return;
        }

        $service = app(CompanyLoanService::class);
        $loan = $service->createLoan(['lender_name' => 'ABC Bank Ltd', 'initial_loan_amount' => 0]);

        $bank = Account::where('name', 'Bank')->first();

        if ($bank) {
            $service->addTransaction($loan, [
                'transaction_type' => 'loan',
                'account_id' => $bank->id,
                'amount' => 100000,
                'date' => now()->format('Y-m-d'),
                'note' => 'Business expansion loan',
            ]);
        }
    }
}
