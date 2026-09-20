<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateBrandingSettingsRequest;
use App\Http\Requests\Settings\UpdateBusinessSettingsRequest;
use App\Http\Requests\Settings\UpdateCategorySettingsRequest;
use App\Http\Requests\Settings\UpdateWeekSettingsRequest;
use App\Models\ExpenseCategory;
use App\Models\GlobalSetting;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class GlobalSettingController extends Controller
{
    public function edit()
    {
        $logoPath = GlobalSetting::get('logo_path');
        $faviconPath = GlobalSetting::get('favicon_path');

        return Inertia::render('settings/global', [
            'settings' => [
                'salary_category_id' => GlobalSetting::get('salary_category_id'),
                'material_expense_category_id' => GlobalSetting::get('material_expense_category_id'),
                'asset_purchase_category_id' => GlobalSetting::get('asset_purchase_category_id'),
                'business_transportation_category_id' => GlobalSetting::get('business_transportation_category_id'),
                'delivery_transportation_category_id' => GlobalSetting::get('delivery_transportation_category_id'),
                'business_name' => GlobalSetting::get('business_name'),
                'business_address' => GlobalSetting::get('business_address'),
                'business_phone' => GlobalSetting::get('business_phone'),
                'business_email' => GlobalSetting::get('business_email'),
                'week_start_day' => GlobalSetting::get('week_start_day', Carbon::SATURDAY),
                'logo_url' => $logoPath ? asset('storage/'.$logoPath) : null,
                'favicon_url' => $faviconPath ? asset('storage/'.$faviconPath) : null,
            ],
            'expense_categories' => ExpenseCategory::ordered()->get(['id', 'name']),
        ]);
    }

    public function updateBusiness(UpdateBusinessSettingsRequest $request)
    {
        $this->saveValues($request->validated());

        return redirect()->back()->with('success', 'Business information updated successfully');
    }

    public function updateWeek(UpdateWeekSettingsRequest $request)
    {
        $this->saveValues($request->validated());

        return redirect()->back()->with('success', 'Business week updated successfully');
    }

    public function updateBranding(UpdateBrandingSettingsRequest $request)
    {
        if ($request->hasFile('logo')) {
            $this->replaceFile($request->file('logo'), 'logo_path');
        }

        if ($request->hasFile('favicon')) {
            $this->replaceFile($request->file('favicon'), 'favicon_path');
        }

        return redirect()->back()->with('success', 'Branding updated successfully');
    }

    public function updateCategories(UpdateCategorySettingsRequest $request)
    {
        $this->saveValues($request->validated());

        return redirect()->back()->with('success', 'Workflow categories updated successfully');
    }

    private function saveValues(array $values): void
    {
        foreach ($values as $key => $value) {
            GlobalSetting::updateOrCreate(['key' => $key], ['value' => $value]);
        }
    }

    private function replaceFile(UploadedFile $file, string $key): void
    {
        $oldPath = GlobalSetting::get($key);

        if ($oldPath) {
            Storage::disk('public')->delete($oldPath);
        }

        GlobalSetting::set($key, $file->store('branding', 'public'));
    }
}
