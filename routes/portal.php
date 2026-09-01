<?php

use App\Http\Controllers\Portal\ActivityController;
use App\Http\Controllers\Portal\AuthController;
use App\Http\Controllers\Portal\InvoiceController;
use App\Http\Controllers\Portal\PasswordController;
use App\Http\Controllers\Portal\ProductPriceController;
use App\Http\Middleware\PortalAuthenticate;
use Illuminate\Support\Facades\Route;

Route::prefix('portal')->name('portal.')->group(function () {
    Route::get('/login', [AuthController::class, 'create'])->name('login');
    Route::post('/login', [AuthController::class, 'store']);

    Route::middleware([PortalAuthenticate::class.':client'])->group(function () {
        Route::post('/logout', [AuthController::class, 'destroy'])->name('logout');

        Route::get('/invoices', [InvoiceController::class, 'index'])->name('invoices.index');
        Route::get('/invoices/{invoice}', [InvoiceController::class, 'show'])->name('invoices.show');

        Route::get('/prices', [ProductPriceController::class, 'index'])->name('prices.index');

        Route::get('/activities', [ActivityController::class, 'index'])->name('activities.index');

        Route::get('/password', [PasswordController::class, 'edit'])->name('password.edit');
        Route::put('/password', [PasswordController::class, 'update'])->name('password.update');
    });
});
