<?php

use App\Http\Controllers\Assets\AssetCategoryController;
use App\Http\Controllers\Assets\AssetController;
use App\Http\Controllers\Categories\CategoryController;
use App\Http\Controllers\Clients\ClientActivityController;
use App\Http\Controllers\Clients\ClientController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Employees\EmployeeController;
use App\Http\Controllers\Employees\EmployeeTransactionController;
use App\Http\Controllers\Expenses\ExpenseCategoryController;
use App\Http\Controllers\Expenses\ExpenseController;
use App\Http\Controllers\Finance\AccountController;
use App\Http\Controllers\Finance\AccountTransferController;
use App\Http\Controllers\Finance\CompanyLoanController;
use App\Http\Controllers\Finance\CompanyLoanTransactionController;
use App\Http\Controllers\Finance\InvestorController;
use App\Http\Controllers\Finance\InvestorTransactionController;
use App\Http\Controllers\Invoices\InvoiceController;
use App\Http\Controllers\Materials\MaterialController;
use App\Http\Controllers\Notes\NoteCategoryController;
use App\Http\Controllers\Notes\NoteController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Outlets\OutletContextController;
use App\Http\Controllers\Outlets\OutletController;
use App\Http\Controllers\Products\ProductController;
use App\Http\Controllers\Reports\ReportController;
use App\Http\Controllers\Roles\RoleController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\Units\UnitController;
use App\Http\Controllers\Users\UserController;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return auth()->check() ? redirect()->route('dashboard') : redirect()->route('login');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/search', [SearchController::class, 'index'])->name('search');

    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead'])->name('notifications.read-all');
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markRead'])->name('notifications.read');

    // Outlets — no destroy route; outlets are deactivated (status=inactive), never deleted.
    Route::resource('outlets', OutletController::class)->only(['index', 'store', 'update'])
        ->middlewareFor('index', 'permission:outlets.view')
        ->middlewareFor('store', 'permission:outlets.create')
        ->middlewareFor('update', 'permission:outlets.edit');
    Route::post('/outlet-context', [OutletContextController::class, 'update'])->name('outlet-context.update');

    // Clients
    Route::resource('clients', ClientController::class)
        ->middlewareFor(['index', 'show'], 'permission:clients.view')
        ->middlewareFor(['create', 'store'], 'permission:clients.create')
        ->middlewareFor(['edit', 'update'], 'permission:clients.edit')
        ->middlewareFor('destroy', 'permission:clients.delete');
    Route::get('/meetings', [ClientActivityController::class, 'index'])->name('meetings.index')->middleware('permission:clients.view');
    Route::post('/clients/{client}/activities', [ClientActivityController::class, 'store'])->name('clients.activities.store')->middleware('permission:clients.edit');
    Route::put('/clients/{client}/activities/{activity}', [ClientActivityController::class, 'update'])->name('clients.activities.update')->middleware('permission:clients.edit');
    Route::delete('/clients/{client}/activities/{activity}', [ClientActivityController::class, 'destroy'])->name('clients.activities.destroy')->middleware('permission:clients.delete');

    // Employees
    Route::get('/employees/payroll-eligible', [EmployeeController::class, 'getEligibleForPayroll'])->name('employees.payroll-eligible')->middleware('permission:employees.view');
    Route::resource('employees', EmployeeController::class)
        ->middlewareFor(['index', 'show'], 'permission:employees.view')
        ->middlewareFor(['create', 'store'], 'permission:employees.create')
        ->middlewareFor(['edit', 'update'], 'permission:employees.edit')
        ->middlewareFor('destroy', 'permission:employees.delete');

    // Staff salary/advance/loan transactions
    Route::post('/employees/{employee}/transactions', [EmployeeTransactionController::class, 'store'])->name('employees.transactions.store')->middleware('permission:payroll.create');
    Route::post('/employees/{employee}/payroll', [EmployeeController::class, 'storePayroll'])->name('employees.payroll.store')->middleware('permission:payroll.create');

    // Catalog: Products, Categories, Units, Materials share one permission set
    Route::resource('products', ProductController::class)
        ->middlewareFor(['index', 'show'], 'permission:catalog.view')
        ->middlewareFor(['create', 'store'], 'permission:catalog.create')
        ->middlewareFor(['edit', 'update'], 'permission:catalog.edit')
        ->middlewareFor('destroy', 'permission:catalog.delete');
    Route::resource('categories', CategoryController::class)
        ->middlewareFor(['index', 'show'], 'permission:catalog.view')
        ->middlewareFor(['create', 'store'], 'permission:catalog.create')
        ->middlewareFor(['edit', 'update'], 'permission:catalog.edit')
        ->middlewareFor('destroy', 'permission:catalog.delete');
    Route::resource('units', UnitController::class)
        ->middlewareFor(['index', 'show'], 'permission:catalog.view')
        ->middlewareFor(['create', 'store'], 'permission:catalog.create')
        ->middlewareFor(['edit', 'update'], 'permission:catalog.edit')
        ->middlewareFor('destroy', 'permission:catalog.delete');
    Route::resource('materials', MaterialController::class)
        ->middlewareFor(['index', 'show'], 'permission:catalog.view')
        ->middlewareFor(['create', 'store'], 'permission:catalog.create')
        ->middlewareFor(['edit', 'update'], 'permission:catalog.edit')
        ->middlewareFor('destroy', 'permission:catalog.delete');

    // Expenses: Expenses + Expense Categories share one permission set
    Route::resource('expenses', ExpenseController::class)
        ->middlewareFor(['index', 'show'], 'permission:expenses.view')
        ->middlewareFor(['create', 'store'], 'permission:expenses.create')
        ->middlewareFor(['edit', 'update'], 'permission:expenses.edit')
        ->middlewareFor('destroy', 'permission:expenses.delete');
    Route::resource('expense-categories', ExpenseCategoryController::class)
        ->middlewareFor(['index', 'show'], 'permission:expenses.view')
        ->middlewareFor(['create', 'store'], 'permission:expenses.create')
        ->middlewareFor(['edit', 'update'], 'permission:expenses.edit')
        ->middlewareFor('destroy', 'permission:expenses.delete');

    // Assets: Assets + Asset Categories share one permission set
    Route::resource('assets', AssetController::class)
        ->middlewareFor(['index', 'show'], 'permission:assets.view')
        ->middlewareFor(['create', 'store'], 'permission:assets.create')
        ->middlewareFor(['edit', 'update'], 'permission:assets.edit')
        ->middlewareFor('destroy', 'permission:assets.delete');
    Route::resource('asset-categories', AssetCategoryController::class)
        ->middlewareFor(['index', 'show'], 'permission:assets.view')
        ->middlewareFor(['create', 'store'], 'permission:assets.create')
        ->middlewareFor(['edit', 'update'], 'permission:assets.edit')
        ->middlewareFor('destroy', 'permission:assets.delete');

    // Notes: Notes + Note Categories share one permission set
    Route::resource('notes', NoteController::class)
        ->middlewareFor(['index', 'show'], 'permission:notes.view')
        ->middlewareFor(['create', 'store'], 'permission:notes.create')
        ->middlewareFor(['edit', 'update'], 'permission:notes.edit')
        ->middlewareFor('destroy', 'permission:notes.delete');
    Route::resource('note-categories', NoteCategoryController::class)
        ->middlewareFor(['index', 'show'], 'permission:notes.view')
        ->middlewareFor(['create', 'store'], 'permission:notes.create')
        ->middlewareFor(['edit', 'update'], 'permission:notes.edit')
        ->middlewareFor('destroy', 'permission:notes.delete');

    // Invoices (custom routes, not a resource() call)
    // NOTE: /invoices/create must be registered before /invoices/{invoice},
    // otherwise Laravel matches "create" as the {invoice} route parameter.
    Route::middleware('permission:invoices.create')->group(function () {
        Route::get('/invoices/create', [InvoiceController::class, 'create'])->name('create-invoice');
        Route::post('/invoices', [InvoiceController::class, 'store'])->name('invoices.store');
    });
    Route::middleware('permission:invoices.view')->group(function () {
        Route::get('/invoices', [InvoiceController::class, 'index'])->name('history');
        Route::get('/invoices/{invoice}', [InvoiceController::class, 'show'])->name('invoices.show');
        Route::get('/invoices/{invoice}/print', [InvoiceController::class, 'print'])->name('invoices.print');
        Route::get('/invoices/{invoice}/pos-print', [InvoiceController::class, 'posPrint'])->name('invoices.pos-print');
    });
    Route::middleware('permission:invoices.edit')->group(function () {
        Route::get('/invoices/{invoice}/edit', [InvoiceController::class, 'edit'])->name('invoices.edit');
        Route::put('/invoices/{invoice}', [InvoiceController::class, 'update'])->name('invoices.update');
        Route::patch('/invoices/{invoice}/status', [InvoiceController::class, 'updateStatus'])->name('invoices.update-status');
        Route::patch('/invoices/{invoice}/payment-status', [InvoiceController::class, 'updatePaymentStatus'])->name('invoices.update-payment-status');
    });
    Route::middleware('permission:invoices.delete')->group(function () {
        Route::delete('/invoices/{invoice}', [InvoiceController::class, 'destroy'])->name('invoices.destroy');
    });

    Route::get('/reports', [ReportController::class, 'index'])->name('reports')->middleware('permission:reports.view');

    // Accounts: no delete route — an account with ledger history can't be safely removed.
    Route::get('/accounts/financial-position', [AccountController::class, 'financialPosition'])
        ->name('accounts.financial-position')
        ->middleware('permission:accounts.view');
    Route::resource('accounts', AccountController::class)->only(['index', 'store', 'show', 'update'])
        ->middlewareFor(['index', 'show'], 'permission:accounts.view')
        ->middlewareFor('store', 'permission:accounts.create')
        ->middlewareFor('update', 'permission:accounts.edit');
    Route::post('/account-transfers', [AccountTransferController::class, 'store'])
        ->name('account-transfers.store')
        ->middleware('permission:accounts.create');

    // Investors & Company Loans share one permission set — only index/store/show + transactions
    Route::resource('investors', InvestorController::class)->only(['index', 'store', 'show'])
        ->middlewareFor(['index', 'show'], 'permission:investor-loans.view')
        ->middlewareFor('store', 'permission:investor-loans.create');
    Route::post('/investors/{investor}/transactions', [InvestorTransactionController::class, 'store'])->name('investors.transactions.store')->middleware('permission:investor-loans.create');

    Route::resource('company-loans', CompanyLoanController::class)->only(['index', 'store', 'show'])
        ->middlewareFor(['index', 'show'], 'permission:investor-loans.view')
        ->middlewareFor('store', 'permission:investor-loans.create');
    Route::post('/company-loans/{companyLoan}/transactions', [CompanyLoanTransactionController::class, 'store'])->name('company-loans.transactions.store')->middleware('permission:investor-loans.create');

    // Roles & Users share one permission set
    Route::resource('roles', RoleController::class)->only(['index', 'store', 'update', 'destroy'])
        ->middlewareFor('index', 'permission:roles.view')
        ->middlewareFor('store', 'permission:roles.create')
        ->middlewareFor('update', 'permission:roles.edit')
        ->middlewareFor('destroy', 'permission:roles.delete');
    Route::resource('users', UserController::class)->only(['index', 'store', 'update', 'destroy'])
        ->middlewareFor('index', 'permission:roles.view')
        ->middlewareFor('store', 'permission:roles.create')
        ->middlewareFor('update', 'permission:roles.edit')
        ->middlewareFor('destroy', 'permission:roles.delete');
});

Route::get('/run-command/{command}', function ($command) {
    Artisan::call($command);

    return Artisan::output();
})->name('run-command.dynamic');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/portal.php';
