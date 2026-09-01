<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\Investor;
use App\Services\InvestorService;
use Illuminate\Database\Seeder;

class InvestorSeeder extends Seeder
{
    public function run(): void
    {
        if (Investor::where('name', 'Kamal Hossain')->exists()) {
            return;
        }

        $service = app(InvestorService::class);
        $investor = $service->createInvestor(['name' => 'Kamal Hossain', 'phone' => '01700000010']);

        $bank = Account::where('name', 'Bank')->first();

        if ($bank) {
            $service->addTransaction($investor, [
                'transaction_type' => 'invest',
                'account_id' => $bank->id,
                'amount' => 50000,
                'date' => now()->format('Y-m-d'),
                'note' => 'Initial capital investment',
            ]);
        }
    }
}
