import { SaveConfirmationModal } from '@/components/save-confirmation-modal';
import { TableRowActions } from '@/components/table-row-actions';
import { Checkbox } from '@/components/ui/checkbox';
import { DataView, type DataViewColumn } from '@/components/ui/data-view';
import { FormButton } from '@/components/ui/form-button';
import { FormInput } from '@/components/ui/form-input';
import { Modal } from '@/components/ui/modal';
import { MODULE_ACTIONS, MODULE_LABELS, permission } from '@/constants/permissions';
import { useDataViewSearch } from '@/hooks/use-data-view-search';
import { useTableLoading } from '@/hooks/use-table-loading';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Role } from '@/types';
import type { RolesProps } from '@/types/pages/roles';
import { Head, useForm } from '@inertiajs/react';
import {
    BarChart3,
    BookOpen,
    FileText,
    HandCoins,
    Landmark,
    Package,
    Plus,
    Receipt,
    Settings as SettingsIcon,
    Shield,
    UserCog,
    Users,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Roles & Permissions',
        href: '/roles',
    },
];

const ACTION_LABELS: Record<string, string> = { view: 'View', create: 'Create', edit: 'Edit', delete: 'Delete' };

const ACTION_STYLES: Record<string, { active: string; inactive: string }> = {
    view: {
        active: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        inactive:
            'border-neutral-200 bg-white text-neutral-400 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-500',
    },
    create: {
        active: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
        inactive:
            'border-neutral-200 bg-white text-neutral-400 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-500',
    },
    edit: {
        active: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
        inactive:
            'border-neutral-200 bg-white text-neutral-400 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-500',
    },
    delete: {
        active: 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400',
        inactive:
            'border-neutral-200 bg-white text-neutral-400 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-500',
    },
};

const MODULE_ICONS: Record<string, typeof Users> = {
    clients: Users,
    catalog: Package,
    invoices: FileText,
    reports: BarChart3,
    employees: UserCog,
    payroll: BookOpen,
    expenses: Receipt,
    assets: Wallet,
    accounts: Landmark,
    'investor-loans': HandCoins,
    settings: SettingsIcon,
    roles: Shield,
};

const MODULES = Object.keys(MODULE_ACTIONS);

function groupPermissionsByModule(permissions: string[]): Record<string, string[]> {
    const grouped: Record<string, string[]> = {};
    for (const p of permissions) {
        const [module, action] = p.split('.');
        (grouped[module] ??= []).push(action);
    }
    return grouped;
}

export default function Roles({ roles, availablePermissions, filters }: RolesProps) {
    const [showModal, setShowModal] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);

    const { search, setSearch, perPage, setPerPage, reset: resetDataView } = useDataViewSearch('roles.index', filters, {}, 'name:asc');
    const isLoading = useTableLoading();

    const { data, setData, post, put, reset, errors, processing, clearErrors } = useForm({
        name: '',
        permissions: [] as string[],
    });

    const openCreateModal = () => {
        setEditingRole(null);
        reset();
        clearErrors();
        setShowModal(true);
    };

    const openEditModal = (role: Role) => {
        setEditingRole(role);
        clearErrors();
        setData({
            name: role.name,
            permissions: role.permissions?.map((p) => p.name) || [],
        });
        setShowModal(true);
    };

    const togglePermission = (perm: string) => {
        setData('permissions', data.permissions.includes(perm) ? data.permissions.filter((p) => p !== perm) : [...data.permissions, perm]);
    };

    const toggleModuleAll = (module: string, checked: boolean) => {
        const modulePermissions = MODULE_ACTIONS[module].map((action) => permission(module, action));
        setData(
            'permissions',
            checked ? [...new Set([...data.permissions, ...modulePermissions])] : data.permissions.filter((p) => !modulePermissions.includes(p)),
        );
    };

    const setAllPermissions = (checked: boolean) => {
        setData('permissions', checked ? [...availablePermissions] : []);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingRole) {
            setShowSaveConfirm(true);
        } else {
            post(route('roles.store'), {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
            });
        }
    };

    const confirmSave = () => {
        if (editingRole) {
            put(route('roles.update', editingRole.id), {
                onSuccess: () => {
                    setShowSaveConfirm(false);
                    setShowModal(false);
                },
                onError: () => setShowSaveConfirm(false),
            });
        }
    };

    const columns: DataViewColumn<Role>[] = [
        {
            key: 'actions',
            label: 'Actions',
            align: 'center',
            render: (role) =>
                role.name !== 'Admin' && (
                    <TableRowActions id={role.id} label={role.name} edit={{ onClick: () => openEditModal(role) }} deleteRoute="roles.destroy" />
                ),
        },
        {
            key: 'name',
            label: 'Name',
            render: (role) => (
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                        <Shield className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">{role.name}</span>
                </div>
            ),
        },
        {
            key: 'permissions',
            label: 'Permissions',
            render: (role) =>
                role.name === 'Admin' ? (
                    <span className="text-xs text-neutral-400 italic">Full access to everything</span>
                ) : (
                    <span className="text-neutral-600 dark:text-neutral-400">{role.permissions?.length ?? 0} granted</span>
                ),
        },
    ];

    const renderRoleCard = (role: Role) => {
        const grouped = groupPermissionsByModule(role.permissions?.map((p) => p.name) || []);

        return (
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                            <Shield className="h-4 w-4" />
                        </div>
                        <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{role.name}</h4>
                    </div>
                    {role.name !== 'Admin' && (
                        <TableRowActions id={role.id} label={role.name} edit={{ onClick: () => openEditModal(role) }} deleteRoute="roles.destroy" />
                    )}
                </div>
                {role.name === 'Admin' ? (
                    <p className="text-xs text-neutral-400 italic">Full access to everything. Cannot be modified.</p>
                ) : Object.keys(grouped).length > 0 ? (
                    <div className="space-y-1.5">
                        {Object.entries(grouped).map(([module, actions]) => (
                            <div key={module} className="flex items-start justify-between gap-2 text-xs">
                                <span className="text-neutral-600 dark:text-neutral-400">{MODULE_LABELS[module] ?? module}</span>
                                <span className="text-right font-medium text-neutral-900 dark:text-neutral-100">
                                    {actions.map((a) => ACTION_LABELS[a] ?? a).join(', ')}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <span className="text-xs text-neutral-400 italic">No permissions assigned</span>
                )}
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles & Permissions" />
            <div className="space-y-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                            <Shield className="h-4 w-4" />
                        </div>
                        <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Roles & Permissions</h1>
                    </div>
                    <FormButton onClick={openCreateModal} icon={<Plus className="h-4 w-4" />}>
                        Add Role
                    </FormButton>
                </div>

                <DataView
                    data={roles.data}
                    getKey={(role) => role.id}
                    loading={isLoading}
                    emptyMessage="No roles found"
                    search={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search roles..."
                    onReset={resetDataView}
                    viewKey="roles"
                    defaultView="card"
                    columns={columns}
                    renderCard={renderRoleCard}
                    cardGridClassName="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    pagination={roles.links}
                    total={roles.total}
                    perPage={perPage}
                    onPerPageChange={setPerPage}
                />
            </div>

            <SaveConfirmationModal
                isOpen={showSaveConfirm}
                onClose={() => setShowSaveConfirm(false)}
                onConfirm={confirmSave}
                title="Save Role Changes"
                description="Are you sure you want to save these changes to the role?"
                isProcessing={processing}
            />

            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    clearErrors();
                }}
                title={editingRole ? `Edit Role — ${editingRole.name}` : 'New Role'}
                size="4xl"
            >
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4 sm:flex-row sm:items-end dark:border-neutral-800 dark:bg-neutral-800/20">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                            <Shield className="h-5 w-5" />
                        </div>
                        <FormInput
                            id="role_name"
                            label="Role Name"
                            required
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="rounded-xl border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                            containerClassName="flex-1"
                            placeholder="e.g. Supervisor"
                            error={errors.name}
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-bold text-neutral-800 dark:text-neutral-200">Permissions by Module</label>
                            <div className="flex gap-3 text-xs font-medium">
                                <button
                                    type="button"
                                    onClick={() => setAllPermissions(true)}
                                    className="text-blue-600 hover:underline dark:text-blue-400"
                                >
                                    Select all
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAllPermissions(false)}
                                    className="text-neutral-500 hover:underline dark:text-neutral-400"
                                >
                                    Clear all
                                </button>
                            </div>
                        </div>

                        <div className="grid max-h-[28rem] grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
                            {MODULES.map((module) => {
                                const Icon = MODULE_ICONS[module] ?? Shield;
                                const actions = MODULE_ACTIONS[module];
                                const modulePermissions = actions.map((action) => permission(module, action));
                                const checkedCount = modulePermissions.filter((p) => data.permissions.includes(p)).length;
                                const allChecked = checkedCount === modulePermissions.length;
                                const someChecked = checkedCount > 0 && !allChecked;

                                return (
                                    <div
                                        key={module}
                                        className={`space-y-3 rounded-2xl border p-3.5 transition-colors ${
                                            checkedCount > 0
                                                ? 'border-blue-200 bg-blue-50/40 dark:border-blue-900/50 dark:bg-blue-900/10'
                                                : 'border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2.5">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                                                    <Icon className="h-4 w-4" />
                                                </div>
                                                <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                                                    {MODULE_LABELS[module] ?? module}
                                                </span>
                                            </div>
                                            <label className="flex cursor-pointer items-center gap-1.5 text-[11px] font-medium text-neutral-400">
                                                <Checkbox
                                                    checked={allChecked ? true : someChecked ? 'indeterminate' : false}
                                                    onCheckedChange={(checked) => toggleModuleAll(module, checked === true)}
                                                    className="size-3.5 rounded"
                                                />
                                                All
                                            </label>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {actions.map((action) => {
                                                const perm = permission(module, action);
                                                const isActive = data.permissions.includes(perm);
                                                const style = ACTION_STYLES[action] ?? ACTION_STYLES.view;
                                                return (
                                                    <button
                                                        type="button"
                                                        key={perm}
                                                        onClick={() => togglePermission(perm)}
                                                        className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                                                            isActive ? style.active : style.inactive
                                                        }`}
                                                    >
                                                        {ACTION_LABELS[action] ?? action}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <p className="text-[11px] text-neutral-400">
                            {data.permissions.length} of {availablePermissions.length} operations selected
                        </p>
                        {errors.permissions && <p className="text-xs text-red-500">{errors.permissions}</p>}
                    </div>

                    <div className="flex gap-2 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                        <FormButton type="submit" loading={processing} className="flex-1 rounded-xl">
                            {processing ? 'Saving...' : editingRole ? 'Update Role' : 'Save Role'}
                        </FormButton>
                        <button
                            type="button"
                            onClick={() => {
                                setShowModal(false);
                                clearErrors();
                            }}
                            className="flex-1 rounded-xl bg-neutral-100 py-2.5 text-sm font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
