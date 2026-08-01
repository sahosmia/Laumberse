<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\ExpenseCategory;
use App\Models\GlobalSetting;
use App\Http\Requests\Settings\UpdateGlobalSettingsRequest;
use Inertia\Inertia;

class GlobalSettingController extends Controller
{
    public function edit()
    {
        return Inertia::render('settings/global', [
            'settings' => [
                'salary_category_id' => GlobalSetting::get('salary_category_id'),
                'material_expense_category_id' => GlobalSetting::get('material_expense_category_id'),

            ],
            'expense_categories' => ExpenseCategory::all(),
        ]);
    }

    public function update(UpdateGlobalSettingsRequest $request)
    {
        $validated = $request->validated();

        GlobalSetting::updateOrCreate(
            ['key' => 'salary_category_id'],
            ['value' => $validated['salary_category_id']]
        );
        GlobalSetting::updateOrCreate(
            ['key' => 'material_expense_category_id'],
            ['value' => $validated['material_expense_category_id']]
        );

        return redirect()->back()->with('success', 'Settings updated successfully');
    }
}
