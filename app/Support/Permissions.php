<?php

namespace App\Support;

/**
 * Single source of truth for every permission name used across route middleware,
 * the sidebar, and the role seeder. Permissions are per-module, per-action
 * ("{module}.{action}"), and only exist for actions that actually have a route —
 * e.g. Accounts has no edit/delete route, so it only defines view/create.
 */
class Permissions
{
    /**
     * Meeting/follow-up notification-recipient permission — NOT a CRUD/authorization permission.
     * A user with this receives notifications for every meeting/follow-up, regardless of who
     * created it. See App\Actions\Meetings\ResolveMeetingNotificationRecipientsAction.
     */
    public const MEETING_NOTIFY_ALL = 'meetings.notify';

    public const MODULES = [
        // module key => [label, actions available]
        'clients' => ['Clients', ['view', 'create', 'edit', 'delete']],
        'catalog' => ['Catalog (Products, Categories, Units, Materials)', ['view', 'create', 'edit', 'delete']],
        'invoices' => ['Invoices', ['view', 'create', 'edit', 'delete']],
        'reports' => ['Reports', ['view']],
        'employees' => ['Employees', ['view', 'create', 'edit', 'delete']],
        'payroll' => ['Staff Salary/Advance/Loan', ['create']],
        'expenses' => ['Expenses', ['view', 'create', 'edit', 'delete']],
        'assets' => ['Assets', ['view', 'create', 'edit', 'delete']],
        'accounts' => ['Accounts', ['view', 'create', 'edit']],
        'investor-loans' => ['Investors & Company Loans', ['view', 'create']],
        'settings' => ['Global Settings', ['view', 'edit']],
        'roles' => ['Roles & Users', ['view', 'create', 'edit', 'delete']],
        'notes' => ['Notes', ['view', 'create', 'edit', 'delete']],
        // Meeting/follow-up CRUD reuses the 'clients' permissions (activities are logged from the
        // client page) — this module exists only for the notification-recipient permission above.
        'meetings' => ['Meeting Notifications', ['notify']],
        // 'switch' is deliberately separate from view/create/edit: it means "may change the
        // active outlet context / select All Outlets," NOT "may manage outlet records." A user
        // can hold one without the other. There is no 'delete' action — outlets are deactivated
        // (status=inactive), never destructively deleted, since outlet-scoped financial/business
        // history must always remain attributable to a real outlet record.
        'outlets' => ['Outlets', ['view', 'create', 'edit', 'switch']],
    ];

    public static function all(): array
    {
        $permissions = [];

        foreach (self::MODULES as $module => [$label, $actions]) {
            foreach ($actions as $action) {
                $permissions[] = "{$module}.{$action}";
            }
        }

        return $permissions;
    }

    public static function label(string $permission): string
    {
        [$module, $action] = explode('.', $permission, 2);
        $moduleLabel = self::MODULES[$module][0] ?? $module;

        return "{$moduleLabel} — ".ucfirst($action);
    }

    /**
     * Default permission set per role, applied by RoleSeeder. Admin is excluded —
     * it bypasses all permission checks via Gate::before in AppServiceProvider.
     */
    public static function defaultsByRole(): array
    {
        return [
            'Manager' => [
                'clients.view', 'clients.create', 'clients.edit', 'clients.delete',
                'catalog.view', 'catalog.create', 'catalog.edit', 'catalog.delete',
                'invoices.view', 'invoices.create', 'invoices.edit', 'invoices.delete',
                'reports.view',
                'employees.view', 'employees.create', 'employees.edit', 'employees.delete',
                'assets.view', 'assets.create', 'assets.edit', 'assets.delete',
                'notes.view', 'notes.create', 'notes.edit', 'notes.delete',
            ],
            'Accountant' => [
                'expenses.view', 'expenses.create', 'expenses.edit', 'expenses.delete',
                'payroll.create',
                'accounts.view', 'accounts.create',
                'investor-loans.view', 'investor-loans.create',
                'reports.view',
                'employees.view',
            ],
            'Sales Staff' => [
                'clients.view', 'clients.create', 'clients.edit',
                'invoices.view', 'invoices.create', 'invoices.edit',
            ],
        ];
    }
}
