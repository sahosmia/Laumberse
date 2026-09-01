<?php

namespace App\Http\Middleware;

use App\Models\GlobalSetting;
use App\Support\OutletContext;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        return array_merge(parent::share($request), [
            // ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                // Explicitly the 'web' guard, not the guard-less $request->user(): Laravel's
                // Authenticate middleware calls Auth::shouldUse($guard) for whichever guard
                // passes, which repoints the default/guard-less user() resolution at that guard
                // for the rest of the request. Portal routes authenticate via the 'client' guard,
                // so on a Portal request $request->user() (no argument) resolves to the
                // authenticated Client, not a staff User — and Client has no Spatie
                // getAllPermissions() (or any staff-permission method), since it deliberately
                // doesn't use HasRoles. Naming the guard here is what keeps this prop (and the
                // permissions lookup below) staff-only regardless of which guard authenticated
                // the current request.
                'user' => $request->user('web'),
                // Deliberately NOT the raw model — it carries staff-only fields (internal_note,
                // financial totals, etc.) that must never reach the client's own browser.
                'client' => $request->user('client') ? [
                    'id' => $request->user('client')->id,
                    'name' => $request->user('client')->name,
                    'client_uuid' => $request->user('client')->client_uuid,
                ] : null,
                'permissions' => $request->user('web')?->getAllPermissions()->pluck('name') ?? [],
            ],
            'notifications' => [
                'unread_count' => $request->user('web')?->unreadNotifications()->count() ?? 0,
            ],
            // Only meaningful for an authenticated staff user — resolved fresh on every request
            // from the session + the user's own permission/assignment, never trusted from the
            // client. See App\Support\OutletContext.
            'outlet' => $request->user('web') ? [
                'current' => OutletContext::current(),
                'assigned' => $request->user('web')->outlet,
                'available' => OutletContext::available()->values(),
                'canSwitch' => OutletContext::canSwitch(),
                'isAll' => OutletContext::isAll(),
            ] : null,
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            'settings' => [
                'salary_category_id' => GlobalSetting::get('salary_category_id'),
                'material_expense_category_id' => GlobalSetting::get('material_expense_category_id'),
                'asset_purchase_category_id' => GlobalSetting::get('asset_purchase_category_id'),
                'business_transportation_category_id' => GlobalSetting::get('business_transportation_category_id'),
                'delivery_transportation_category_id' => GlobalSetting::get('delivery_transportation_category_id'),
                'business_name' => GlobalSetting::get('business_name'),
                'logo_url' => ($logoPath = GlobalSetting::get('logo_path')) ? asset('storage/'.$logoPath) : null,
            ],
        ]);
    }
}
