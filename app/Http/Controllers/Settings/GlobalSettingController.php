<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\ExpenseCategory;
use App\Models\GlobalSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GlobalSettingController extends Controller
{
    public function edit()
    {
        return Inertia::render('settings/global', [
            'settings' => [
                'salary_category_id' => GlobalSetting::get('salary_category_id'),
            ],
            'expense_categories' => ExpenseCategory::all(),
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'salary_category_id' => 'required|exists:expense_categories,id',
        ]);

        GlobalSetting::updateOrCreate(
            ['key' => 'salary_category_id'],
            ['value' => $validated['salary_category_id']]
        );

        return redirect()->back()->with('success', 'Settings updated successfully');
    }
}
