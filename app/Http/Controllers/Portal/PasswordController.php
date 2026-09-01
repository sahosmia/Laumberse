<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Http\Requests\Portal\UpdatePortalPasswordRequest;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PasswordController extends Controller
{
    public function edit()
    {
        return Inertia::render('portal/password');
    }

    public function update(UpdatePortalPasswordRequest $request)
    {
        Auth::guard('client')->user()->update([
            'password' => $request->validated('password'),
        ]);

        return redirect()->back()->with('success', 'Password updated successfully.');
    }
}
