import { SaveConfirmationModal } from '@/components/save-confirmation-modal';
import { TableRowActions } from '@/components/table-row-actions';
import { DataView, type DataViewColumn } from '@/components/ui/data-view';
import { FormButton } from '@/components/ui/form-button';
import { FormInput } from '@/components/ui/form-input';
import { FormLabel } from '@/components/ui/form-label';
import { FormSelect } from '@/components/ui/form-select';
import { Modal } from '@/components/ui/modal';
import { PasswordInput } from '@/components/ui/password-input';
import { useDataViewSearch } from '@/hooks/use-data-view-search';
import { useTableLoading } from '@/hooks/use-table-loading';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, User } from '@/types';
import type { UsersProps } from '@/types/pages/users';
import { Head, useForm } from '@inertiajs/react';
import { Plus, UserCircle } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Staff Users',
        href: '/users',
    },
];

export default function Users({ users, roles, outlets, filters }: UsersProps) {
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);

    const { search, setSearch, perPage, setPerPage, reset: resetDataView } = useDataViewSearch('users.index', filters, {}, 'name:asc');
    const isLoading = useTableLoading();

    const { data, setData, post, put, reset, errors, processing, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        role: roles[0] ?? '',
        outlet_id: '' as number | '',
    });

    const isAdminRole = data.role === 'Admin';

    const openCreateModal = () => {
        setEditingUser(null);
        reset();
        clearErrors();
        setShowModal(true);
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        clearErrors();
        setData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.roles?.[0]?.name ?? roles[0] ?? '',
            outlet_id: user.outlet_id ?? '',
        });
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUser) {
            setShowSaveConfirm(true);
        } else {
            post(route('users.store'), {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
            });
        }
    };

    const confirmSave = () => {
        if (editingUser) {
            put(route('users.update', editingUser.id), {
                onSuccess: () => {
                    setShowSaveConfirm(false);
                    setShowModal(false);
                },
                onError: () => setShowSaveConfirm(false),
            });
        }
    };

    const columns: DataViewColumn<User>[] = [
        {
            key: 'actions',
            label: 'Actions',
            align: 'center',
            render: (u) => (
                <div className="flex items-center justify-center">
                    <TableRowActions id={u.id} label={u.name} edit={{ onClick: () => openEditModal(u) }} deleteRoute="users.destroy" />
                </div>
            ),
        },
        {
            key: 'name',
            label: 'Name',
            render: (u) => (
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        <UserCircle className="h-4 w-4" />
                    </div>
                    <div className="font-medium text-neutral-900 dark:text-neutral-100">{u.name}</div>
                </div>
            ),
        },
        {
            key: 'email',
            label: 'Email',
            className: 'text-neutral-600 dark:text-neutral-400',
            render: (u) => u.email,
        },
        {
            key: 'role',
            label: 'Role',
            render: (u) => (
                <span className="rounded-md bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                    {u.roles?.[0]?.name ?? 'No role'}
                </span>
            ),
        },
        {
            key: 'outlet',
            label: 'Outlet',
            className: 'text-neutral-600 dark:text-neutral-400',
            render: (u) => u.outlet?.name ?? <span className="text-neutral-400 italic">All Outlets</span>,
        },
    ];

    const renderUserCard = (u: User) => (
        <div className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 transition-all hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
            <div className="absolute top-4 right-4">
                <TableRowActions id={u.id} label={u.name} edit={{ onClick: () => openEditModal(u) }} deleteRoute="users.destroy" />
            </div>
            <div className="flex items-start gap-4 pr-8">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/20">
                    <UserCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0">
                    <h4 className="truncate font-bold text-neutral-900 dark:text-neutral-100">{u.name}</h4>
                    <p className="truncate text-xs text-neutral-400">{u.email}</p>
                    <span className="mt-1.5 inline-block rounded-md bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                        {u.roles?.[0]?.name ?? 'No role'}
                    </span>
                    <p className="mt-1 text-xs text-neutral-400">{u.outlet?.name ?? 'All Outlets'}</p>
                </div>
            </div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Staff Users" />
            <div className="space-y-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                            <UserCircle className="h-4 w-4" />
                        </div>
                        <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Staff Users</h1>
                    </div>
                    <FormButton onClick={openCreateModal} icon={<Plus className="h-4 w-4" />}>
                        Add User
                    </FormButton>
                </div>

                <DataView
                    data={users.data}
                    getKey={(u) => u.id}
                    loading={isLoading}
                    emptyMessage="No staff users found"
                    search={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search by name or email..."
                    onReset={resetDataView}
                    viewKey="users"
                    defaultView="table"
                    columns={columns}
                    renderCard={renderUserCard}
                    pagination={users.links}
                    total={users.total}
                    perPage={perPage}
                    onPerPageChange={setPerPage}
                />
            </div>

            <SaveConfirmationModal
                isOpen={showSaveConfirm}
                onClose={() => setShowSaveConfirm(false)}
                onConfirm={confirmSave}
                title="Save User Changes"
                description="Are you sure you want to save these changes to the user?"
                isProcessing={processing}
            />

            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    clearErrors();
                }}
                title={editingUser ? 'Edit User' : 'New User'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormInput
                        id="user_name"
                        label="Name"
                        required
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className="rounded-xl border-neutral-200 bg-transparent dark:border-neutral-800 dark:text-neutral-100"
                        error={errors.name}
                    />
                    <FormInput
                        id="user_email"
                        label="Email"
                        type="email"
                        required
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        className="rounded-xl border-neutral-200 bg-transparent dark:border-neutral-800 dark:text-neutral-100"
                        error={errors.email}
                    />
                    <PasswordInput
                        id="user_password"
                        label={editingUser ? 'New Password' : 'Password'}
                        required={!editingUser}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        className="rounded-xl border-neutral-200 bg-transparent dark:border-neutral-800 dark:text-neutral-100"
                        placeholder={editingUser ? 'Leave blank to keep current' : 'Password'}
                        error={errors.password}
                    />
                    <div className="space-y-1.5">
                        <FormLabel htmlFor="user_role" required>
                            Role
                        </FormLabel>
                        <FormSelect
                            id="user_role"
                            value={data.role}
                            onChange={(e) => setData('role', e.target.value)}
                            className="py-2 dark:bg-neutral-900"
                        >
                            {roles.map((role) => (
                                <option key={role} value={role}>
                                    {role}
                                </option>
                            ))}
                        </FormSelect>
                        {errors.role && <p className="text-xs text-red-500">{errors.role}</p>}
                    </div>

                    {!isAdminRole && (
                        <FormSelect
                            id="user_outlet"
                            label="Outlet"
                            required
                            value={data.outlet_id}
                            onChange={(e) => setData('outlet_id', e.target.value ? Number(e.target.value) : '')}
                            className="py-2 dark:bg-neutral-900"
                            error={errors.outlet_id}
                            helperText="The outlet this user is restricted to."
                        >
                            <option value="">Select an outlet</option>
                            {outlets.map((outlet) => (
                                <option key={outlet.id} value={outlet.id}>
                                    {outlet.name}
                                </option>
                            ))}
                        </FormSelect>
                    )}

                    <div className="flex gap-2 pt-2">
                        <FormButton type="submit" loading={processing} className="flex-1 rounded-xl">
                            {processing ? 'Saving...' : editingUser ? 'Update User' : 'Save User'}
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
