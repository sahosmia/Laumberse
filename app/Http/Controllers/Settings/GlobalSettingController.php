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
                'business_transportation_category_id' => GlobalSetting::get('business_transportation_category_id'),
                'delivery_transportation_category_id' => GlobalSetting::get('delivery_transportation_category_id'),
            ],
            'expense_categories' => ExpenseCategory::all(),
        ]);
    }

    public function update(UpdateGlobalSettingsRequest $request)
    {
        $validated = $request->validated();

        foreach ($validated as $key => $value) {
            GlobalSetting::updateOrCreate(['key' => $key], ['value' => $value]);
        }

        return redirect()->back()->with('success', 'Settings updated successfully');
    }
}
