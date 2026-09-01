/** Mirrors App\Support\Permissions::MODULES — keep both in sync when permissions change. */
export const PERMISSION_MODULES = {
    CLIENTS: 'clients',
    CATALOG: 'catalog',
    INVOICES: 'invoices',
    REPORTS: 'reports',
    EMPLOYEES: 'employees',
    PAYROLL: 'payroll',
    EXPENSES: 'expenses',
    ASSETS: 'assets',
    ACCOUNTS: 'accounts',
    INVESTOR_LOANS: 'investor-loans',
    SETTINGS: 'settings',
    ROLES: 'roles',
    NOTES: 'notes',
    MEETINGS: 'meetings',
    OUTLETS: 'outlets',
} as const;

/** Only the actions each module actually has a route for — must match Permissions::MODULES on the backend. */
export const MODULE_ACTIONS: Record<string, readonly string[]> = {
    clients: ['view', 'create', 'edit', 'delete'],
    catalog: ['view', 'create', 'edit', 'delete'],
    invoices: ['view', 'create', 'edit', 'delete'],
    reports: ['view'],
    employees: ['view', 'create', 'edit', 'delete'],
    payroll: ['create'],
    expenses: ['view', 'create', 'edit', 'delete'],
    assets: ['view', 'create', 'edit', 'delete'],
    accounts: ['view', 'create', 'edit'],
    'investor-loans': ['view', 'create'],
    settings: ['view', 'edit'],
    roles: ['view', 'create', 'edit', 'delete'],
    notes: ['view', 'create', 'edit', 'delete'],
    meetings: ['notify'],
    outlets: ['view', 'create', 'edit', 'switch'],
};

export const MODULE_LABELS: Record<string, string> = {
    clients: 'Clients',
    catalog: 'Catalog (Products, Categories, Units, Materials)',
    invoices: 'Invoices',
    reports: 'Reports',
    employees: 'Employees',
    payroll: 'Staff Salary/Advance/Loan',
    expenses: 'Expenses',
    assets: 'Assets',
    accounts: 'Accounts',
    'investor-loans': 'Investors & Company Loans',
    settings: 'Global Settings',
    roles: 'Roles & Users',
    notes: 'Notes',
    meetings: 'Meeting Notifications',
    outlets: 'Outlets',
};

const ACTION_LABELS: Record<string, string> = {
    view: 'View',
    create: 'Create',
    edit: 'Edit',
    delete: 'Delete',
    notify: 'Receive all meeting notifications',
    switch: 'Switch active outlet',
};

/** e.g. permission('clients', 'view') === 'clients.view' */
export function permission(module: string, action: string): string {
    return `${module}.${action}`;
}

export function permissionLabel(permissionName: string): string {
    const [module, action] = permissionName.split('.');
    return `${MODULE_LABELS[module] ?? module} — ${ACTION_LABELS[action] ?? action}`;
}
