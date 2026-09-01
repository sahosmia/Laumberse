<?php

namespace App\Http\Controllers\Outlets;

use App\Http\Controllers\Controller;
use App\Models\Outlet;
use App\Support\OutletContext;
use Illuminate\Http\Request;

/**
 * Backend-controlled outlet switching — the only place the active-outlet session value is ever
 * written. Never trusts anything beyond "is this outlet id (or 'all') actually valid and is this
 * user actually allowed to pick it," per App\Support\OutletContext.
 */
class OutletContextController extends Controller
{
    public function update(Request $request)
    {
        if (! OutletContext::canSwitch()) {
            abort(403);
        }

        $validated = $request->validate([
            'outlet' => 'required|string',
        ]);

        $target = $validated['outlet'];

        if ($target !== 'all' && ! Outlet::whereKey($target)->active()->exists()) {
            abort(404);
        }

        OutletContext::set($target);

        return redirect()->back();
    }
}
