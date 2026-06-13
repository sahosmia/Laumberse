<?php

use App\Http\Controllers\ManageAssetController;
use App\Http\Controllers\AssetCategoryController;
use App\Http\Controllers\Employees\EmployeeController;
use App\Http\Controllers\PayrollController;

use App\Http\Controllers\Clients\ClientController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Expenses\ExpenseCategoryController;
use App\Http\Controllers\Expenses\ExpenseController;
use App\Http\Controllers\Invoices\InvoiceController;
use App\Http\Controllers\Products\ProductController;
use App\Http\Controllers\Reports\ReportController;
use App\Http\Controllers\Categories\CategoryController;
use App\Http\Controllers\Outlets\OutletController;
use App\Http\Controllers\UnitController;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return auth()->check() ? redirect()->route('dashboard') : redirect()->route('login');
})->name('home');


Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('clients', ClientController::class);
    Route::resource('employees', EmployeeController::class);
    Route::delete('/products/bulk-destroy', [ProductController::class, 'bulkDestroy'])->name('products.bulk-destroy');
    Route::resource('products', ProductController::class);
    Route::resource('categories', CategoryController::class);
    Route::resource('units', UnitController::class);
    Route::delete('/outlets/bulk-destroy', [OutletController::class, 'bulkDestroy'])->name('outlets.bulk-destroy');
    Route::resource('outlets', OutletController::class);

    Route::resource('expenses', ExpenseController::class);
    Route::resource('expense-categories', ExpenseCategoryController::class);
    Route::get('/employees/payroll-eligible', [EmployeeController::class, 'getEligibleForPayroll'])->name('employees.payroll-eligible');
     Route::resource('payrolls', PayrollController::class)->only(['index']);
    Route::get('/employees/payroll-eligible', [EmployeeController::class, 'getEligibleForPayroll'])->name('employees.payroll-eligible');

    Route::resource('manage-assets', ManageAssetController::class);
    Route::resource('asset-categories', AssetCategoryController::class);

    Route::get('/invoices', [InvoiceController::class, 'index'])->name('history');
    Route::get('/invoices/create', [InvoiceController::class, 'create'])->name('create-invoice');
    Route::post('/invoices', [InvoiceController::class, 'store'])->name('invoices.store');
    Route::get('/invoices/{invoice}/edit', [InvoiceController::class, 'edit'])->name('invoices.edit');
    Route::put('/invoices/{invoice}', [InvoiceController::class, 'update'])->name('invoices.update');
    Route::get('/invoices/{invoice}', [InvoiceController::class, 'show'])->name('invoices.show');
    Route::patch('/invoices/{invoice}/status', [InvoiceController::class, 'updateStatus'])->name('invoices.update-status');
    Route::get('/invoices/{invoice}/print', [InvoiceController::class, 'print'])->name('invoices.print');
    Route::delete('/invoices/bulk-destroy', [InvoiceController::class, 'bulkDestroy'])->name('invoices.bulk-destroy');
    Route::delete('/invoices/{invoice}', [InvoiceController::class, 'destroy'])->name('invoices.destroy');

    Route::get('/reports', [ReportController::class, 'index'])->name('reports');
});


Route::get('/run-command/{command}', function ($command) {
    Artisan::call($command);
    return Artisan::output();
})->name('run-command.dynamic');

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
