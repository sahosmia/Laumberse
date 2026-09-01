<?php

namespace Database\Seeders;

use App\Support\Permissions;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // Admin bypasses every check via Gate::before, but also gets every permission
        // explicitly so any frontend code that reads the permission list (e.g. the
        // sidebar) sees a complete set without needing special-case Admin logic.
        $admin = Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'web']);
        $admin->syncPermissions(Permissions::all());

        foreach (Permissions::defaultsByRole() as $roleName => $permissions) {
            $role = Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
            $role->syncPermissions($permissions);
        }
    }
}
