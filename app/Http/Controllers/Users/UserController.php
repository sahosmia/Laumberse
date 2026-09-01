<?php

namespace App\Http\Controllers\Users;

use App\Http\Controllers\Controller;
use App\Http\Requests\Users\StoreUserRequest;
use App\Models\Outlet;
use App\Models\User;
use App\Support\PerPage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /** value => [column, direction] — whitelisted so the raw `sort` query param never reaches orderBy(). */
    private const SORTABLE = [
        'name:asc' => ['name', 'asc'],
        'name:desc' => ['name', 'desc'],
        'created_at:desc' => ['created_at', 'desc'],
        'created_at:asc' => ['created_at', 'asc'],
    ];

    public function index(Request $request)
    {
        [$sortColumn, $sortDirection] = self::SORTABLE[$request->sort] ?? self::SORTABLE['name:asc'];
        $perPage = PerPage::resolve($request);

        $users = User::with(['roles:id,name', 'outlet:id,name,code'])
            ->when($request->search, fn ($q, $s) => $q->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")->orWhere('email', 'like', "%{$s}%");
            }))
            ->orderBy($sortColumn, $sortDirection)
            ->orderBy('id', $sortDirection)
            ->paginate($perPage, ['id', 'name', 'email', 'outlet_id', 'created_at'])
            ->withQueryString();

        return Inertia::render('users/index', [
            'users' => $users,
            'roles' => Role::orderBy('name')->pluck('name'),
            'outlets' => Outlet::active()->orderBy('name')->get(['id', 'name', 'code']),
            'filters' => [
                'search' => $request->search,
                'sort' => $request->sort,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(StoreUserRequest $request)
    {
        try {
            DB::transaction(function () use ($request) {
                $user = User::create([
                    'name' => $request->validated('name'),
                    'email' => $request->validated('email'),
                    'password' => Hash::make($request->validated('password')),
                    'outlet_id' => $request->validated('outlet_id'),
                ]);
                $user->syncRoles([$request->validated('role')]);
            });

            return redirect()->back()->with('success', 'User created successfully.');
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to create user.');
        }
    }

    public function update(StoreUserRequest $request, User $user)
    {
        try {
            DB::transaction(function () use ($request, $user) {
                $data = [
                    'name' => $request->validated('name'),
                    'email' => $request->validated('email'),
                    'outlet_id' => $request->validated('outlet_id'),
                ];
                if ($request->filled('password')) {
                    $data['password'] = Hash::make($request->validated('password'));
                }
                $user->update($data);
                $user->syncRoles([$request->validated('role')]);
            });

            return redirect()->back()->with('success', 'User updated successfully.');
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to update user.');
        }
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return redirect()->back()->with('error', 'You cannot delete your own account.');
        }

        try {
            $user->delete();

            return redirect()->back()->with('success', 'User deleted successfully.');
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to delete user.');
        }
    }
}
