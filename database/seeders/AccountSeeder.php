<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Services\AccountService;
use Illuminate\Database\Seeder;

class AccountSeeder extends Seeder
{
    public function run(): void
    {
        $accounts = [
            ['name' => 'Cash', 'account_number' => null, 'opening_balance' => 20000],
            // Kept above AssetSeeder's 245,000 laptop purchase (runs right after this seeder) so the demo data doesn't hit InsufficientBalanceException.
            ['name' => 'Bank', 'account_number' => 'ACC-1001', 'opening_balance' => 300000],
        ];

        foreach ($accounts as $data) {
            if (Account::where('name', $data['name'])->exists()) {
                continue;
            }

            app(AccountService::class)->createAccount($data);
        }
    }
}
