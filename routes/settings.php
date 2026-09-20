<?php

use App\Http\Controllers\Settings\GlobalSettingController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', 'settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');
    Route::put('settings/password', [PasswordController::class, 'update'])->name('password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance');

    Route::get('settings/global', [GlobalSettingController::class, 'edit'])->name('settings.global.edit')->middleware('permission:settings.view');
    Route::patch('settings/global/business', [GlobalSettingController::class, 'updateBusiness'])->name('settings.global.business.update')->middleware('permission:settings.edit');
    Route::patch('settings/global/week', [GlobalSettingController::class, 'updateWeek'])->name('settings.global.week.update')->middleware('permission:settings.edit');
    Route::patch('settings/global/branding', [GlobalSettingController::class, 'updateBranding'])->name('settings.global.branding.update')->middleware('permission:settings.edit');
    Route::patch('settings/global/categories', [GlobalSettingController::class, 'updateCategories'])->name('settings.global.categories.update')->middleware('permission:settings.edit');
});
