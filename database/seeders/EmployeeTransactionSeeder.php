<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\Employee;
use App\Services\EmployeeTransactionService;
use Illuminate\Database\Seeder;

class EmployeeTransactionSeeder extends Seeder
{
    public function run(): void
    {
        $employee = Employee::where('employee_id', 'EMP001')->first();
        $cash = Account::where('name', 'Cash')->first();

        if (! $employee || ! $cash || $employee->transactions()->exists()) {
            return;
        }

        app(EmployeeTransactionService::class)->addTransaction($employee, [
            'transaction_type' => 'advance',
            'account_id' => $cash->id,
            'amount' => 2000,
            'date' => now()->format('Y-m-d'),
            'note' => 'Emergency advance',
        ]);
    }
}
