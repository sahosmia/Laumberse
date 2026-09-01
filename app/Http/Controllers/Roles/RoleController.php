<?php

namespace App\Http\Controllers\Roles;

use App\Http\Controllers\Controller;
use App\Http\Requests\Roles\StoreRoleRequest;
use App\Support\Permissions;
use App\Support\PerPage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
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

        $roles = Role::with('permissions:id,name')
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->orderBy($sortColumn, $sortDirection)
            ->orderBy('id', $sortDirection)
            ->paginate($perPage, ['id', 'name', 'created_at'])
            ->withQueryString();

        return Inertia::render('roles/index', [
            'roles' => $roles,
            'availablePermissions' => Permissions::all(),
            'filters' => [
                'search' => $request->search,
                'sort' => $request->sort,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(StoreRoleRequest $request)
    {
        try {
            DB::transaction(function () use ($request) {
                $role = Role::create(['name' => $request->validated('name'), 'guard_name' => 'web']);
                $role->syncPermissions($request->validated('permissions') ?? []);
            });

            return redirect()->back()->with('success', 'Role created successfully.');
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to create role.');
        }
    }

    public function update(StoreRoleRequest $request, Role $role)
    {
        if ($role->name === 'Admin') {
            return redirect()->back()->with('error', 'The Admin role cannot be modified.');
        }

        try {
            DB::transaction(function () use ($request, $role) {
                $role->update(['name' => $request->validated('name')]);
                $role->syncPermissions($request->validated('permissions') ?? []);
            });

            return redirect()->back()->with('success', 'Role updated successfully.');
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to update role.');
        }
    }

    public function destroy(Role $role)
    {
        if ($role->name === 'Admin') {
            return redirect()->back()->with('error', 'The Admin role cannot be deleted.');
        }

        if ($role->users()->exists()) {
            return redirect()->back()->with('error', 'Cannot delete a role that is still assigned to users.');
        }

        try {
            $role->delete();

            return redirect()->back()->with('success', 'Role deleted successfully.');
        } catch (\Throwable $e) {
            report($e);

            return redirect()->back()->with('error', 'Failed to delete role.');
        }
    }
}
