import { SaveConfirmationModal } from '@/components/save-confirmation-modal';
import { TableRowActions } from '@/components/table-row-actions';
import { Checkbox } from '@/components/ui/checkbox';
import { DataView, type DataViewColumn } from '@/components/ui/data-view';
import { FilterSelect } from '@/components/ui/filter-select';
import { FormButton } from '@/components/ui/form-button';
import { FormInput } from '@/components/ui/form-input';
import { FormLabel } from '@/components/ui/form-label';
import { FormSelect } from '@/components/ui/form-select';
import { Modal } from '@/components/ui/modal';
import { useDataViewSearch } from '@/hooks/use-data-view-search';
import { useTableLoading } from '@/hooks/use-table-loading';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/format';
import { type BreadcrumbItem, Employee, SharedData } from '@/types';
import type { EmployeesProps } from '@/types/pages/employees';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { CircleCheck, Plus, User, UserCheck, UserCog, Users, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Employees',
        href: '/employees',
    },
];

export default function Employees({ employees, filters, summary }: EmployeesProps) {
    const { outlet } = usePage<SharedData>().props;
    const [showModal, setShowModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);

    const { data, setData, post, put, reset, errors, processing, clearErrors } = useForm({
        employee_id: '',
        name: '',
        phone: '',
        email: '',
        designation: '',
        base_salary: '' as string | number,
        opening_balance: '' as string | number,
        outlet_id: '' as number | '',
        is_active: true,
    });

    const {
        search,
        setSearch,
        perPage,
        setPerPage,
        filterValues,
        setFilter,
        reset: resetDataView,
    } = useDataViewSearch('employees.index', filters, {}, 'created_at:desc', 300, { status: filters.status || '' });
    const isLoading = useTableLoading();

    const openCreateModal = () => {
        setEditingEmployee(null);
        reset();
        clearErrors();
        setShowModal(true);
    };

    useEffect(() => {
        if (new URLSearchParams(window.location.search).get('action') === 'create') {
            openCreateModal();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const openEditModal = (employee: Employee) => {
        setEditingEmployee(employee);
        clearErrors();
        setData({
            employee_id: employee.employee_id,
            name: employee.name,
            phone: employee.phone,
            email: employee.email || '',
            designation: employee.designation,
            base_salary: employee.base_salary,
            is_active: employee.is_active,
        });
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingEmployee) {
            setShowSaveConfirm(true);
        } else {
            post(route('employees.store'), {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
            });
        }
    };

    const confirmSave = () => {
        if (editingEmployee) {
            put(route('employees.update', editingEmployee.id), {
                onSuccess: () => {
                    setShowSaveConfirm(false);
                    setShowModal(false);
                },
                onError: () => {
                    setShowSaveConfirm(false);
                },
            });
        }
    };

    const columns: DataViewColumn<Employee>[] = [
        {
            key: 'actions',
            label: 'Actions',
            align: 'center',
            render: (e) => (
                <TableRowActions
                    id={e.id}
                    label={e.name}
                    view={{ href: route('employees.show', e.id), label: 'View Ledger' }}
                    edit={{ onClick: () => openEditModal(e) }}
                    deleteRoute="employees.destroy"
                />
            ),
        },
        {
            key: 'employee_id',
            label: 'Employee ID',
            className: 'font-mono text-xs text-neutral-400',
            render: (e) => e.employee_id,
        },
        {
            key: 'name',
            label: 'Name',
            render: (e) => (
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        <User className="h-4 w-4" />
                    </div>
                    <div className="font-medium text-neutral-900 dark:text-neutral-100">{e.name}</div>
                </div>
            ),
        },
        {
            key: 'designation',
            label: 'Designation',
            className: 'text-neutral-600 dark:text-neutral-400',
            render: (e) => e.designation,
        },
        {
            key: 'phone',
            label: 'Phone',
            className: 'text-neutral-600 dark:text-neutral-400',
            render: (e) => e.phone,
        },
        {
            key: 'status',
            label: 'Status',
            render: (e) => (
                <span
                    className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase ${e.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}
                >
                    {e.is_active ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            key: 'base_salary',
            label: 'Base Salary',
            align: 'right',
            className: 'font-bold text-neutral-900 dark:text-neutral-100',
            render: (e) => formatCurrency(e.base_salary),
        },
        {
            key: 'balance',
            label: 'Balance',
            align: 'right',
            className: 'font-semibold',
            render: (e) => (
                <span className={e.current_balance > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-neutral-500'}>
                    {formatCurrency(e.current_balance)}
                </span>
            ),
        },
    ];

    const renderEmployeeCard = (e: Employee) => (
        <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        <User className="h-4 w-4" />
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{e.name}</h4>
                            <span className="font-mono text-[10px] text-neutral-400">{e.employee_id}</span>
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">{e.designation}</p>
                    </div>
                </div>
                <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${e.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}
                >
                    {e.is_active ? 'Active' : 'Inactive'}
                </span>
            </div>
            <div className="flex items-center justify-between border-t border-neutral-100 pt-2.5 text-xs dark:border-neutral-800">
                <div>
                    <p className="font-medium text-neutral-400">Phone</p>
                    <p className="font-semibold text-neutral-700 dark:text-neutral-300">{e.phone}</p>
                </div>
                <div className="text-right">
                    <p className="font-medium text-neutral-400">Base Salary</p>
                    <p className="font-bold text-neutral-900 dark:text-neutral-100">{formatCurrency(e.base_salary)}</p>
                </div>
            </div>
            <div className="flex items-center justify-between border-t border-neutral-100 pt-2.5 text-xs dark:border-neutral-800">
                <div>
                    <p className="font-medium text-neutral-400">Balance</p>
                    <p className={`font-bold ${e.current_balance > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-neutral-500'}`}>
                        {formatCurrency(e.current_balance)}
                    </p>
                </div>
                <Link href={route('employees.show', e.id)} className="font-semibold text-blue-600 hover:underline dark:text-blue-400">
                    View Ledger
                </Link>
            </div>
            <div className="flex justify-end border-t border-neutral-100 pt-2.5 dark:border-neutral-800">
                <TableRowActions id={e.id} label={e.name} edit={{ onClick: () => openEditModal(e) }} deleteRoute="employees.destroy" />
            </div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Employees" />
            <div className="space-y-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                            <Users className="h-4 w-4" />
                        </div>
                        <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Employees</h1>
                    </div>
                    <FormButton onClick={openCreateModal} icon={<Plus className="h-4 w-4" />}>
                        Add Employee
                    </FormButton>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                            <UserCog className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Total Staff</p>
                            <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{summary.total_staff}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                            <UserCheck className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Active Staff</p>
                            <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{summary.active_staff}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                            <Wallet className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Pending Advances / Loans</p>
                            <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{formatCurrency(summary.pending_advances)}</p>
                        </div>
                    </div>
                </div>

                <DataView
                    data={employees.data}
                    getKey={(e) => e.id}
                    loading={isLoading}
                    emptyMessage="No employees found"
                    search={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search employees..."
                    filters={
                        <FilterSelect
                            icon={<CircleCheck className="h-4 w-4" />}
                            containerClassName="w-full sm:w-44"
                            value={filterValues.status ?? ''}
                            onChange={(e) => setFilter('status', e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </FilterSelect>
                    }
                    onReset={resetDataView}
                    viewKey="employees"
                    defaultView="table"
                    columns={columns}
                    renderCard={renderEmployeeCard}
                    pagination={employees.links}
                    total={employees.total}
                    perPage={perPage}
                    onPerPageChange={setPerPage}
                />
            </div>

            <SaveConfirmationModal
                isOpen={showSaveConfirm}
                onClose={() => setShowSaveConfirm(false)}
                onConfirm={confirmSave}
                title="Save Employee Changes"
                description="Are you sure you want to save these changes to the employee?"
                isProcessing={processing}
            />

            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    clearErrors();
                }}
                title={editingEmployee ? 'Edit Employee' : 'New Employee'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormInput
                        label="Employee ID (leave blank to auto-generate)"
                        value={data.employee_id}
                        onChange={(e) => setData('employee_id', e.target.value)}
                        placeholder="e.g. EMP-0001"
                        error={errors.employee_id}
                    />
                    <FormInput label="Name" value={data.name} onChange={(e) => setData('name', e.target.value)} required error={errors.name} />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormInput
                            label="Phone"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            required
                            error={errors.phone}
                        />
                        <FormInput
                            label="Designation"
                            value={data.designation}
                            onChange={(e) => setData('designation', e.target.value)}
                            required
                            error={errors.designation}
                        />
                    </div>
                    <FormInput
                        label="Email (Optional)"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        error={errors.email}
                    />
                    <FormInput
                        label="Base Salary"
                        type="number"
                        value={data.base_salary}
                        onChange={(e) => setData('base_salary', e.target.value)}
                        required
                        error={errors.base_salary}
                    />
                    {!editingEmployee && (
                        <FormInput
                            label="Opening Balance (Optional)"
                            type="number"
                            step="0.01"
                            min="0"
                            value={data.opening_balance}
                            onChange={(e) => setData('opening_balance', e.target.value)}
                            helperText="Any outstanding advance/loan balance carried over for this staff member"
                            error={errors.opening_balance}
                        />
                    )}
                    {!editingEmployee && outlet?.isAll && (
                        <div className="space-y-1">
                            <FormLabel required>Outlet</FormLabel>
                            <FormSelect
                                value={data.outlet_id}
                                onChange={(e) => setData('outlet_id', e.target.value ? Number(e.target.value) : '')}
                                required
                            >
                                <option value="">Select an outlet</option>
                                {outlet.available.map((o) => (
                                    <option key={o.id} value={o.id}>
                                        {o.name}
                                    </option>
                                ))}
                            </FormSelect>
                            {errors.outlet_id && <p className="text-xs text-red-500">{errors.outlet_id}</p>}
                        </div>
                    )}
                    {editingEmployee && (
                        <div className="flex items-center gap-2 py-1">
                            <Checkbox
                                id="is_active"
                                checked={data.is_active}
                                onCheckedChange={(checked) => setData('is_active', checked === true)}
                                className="min-h-12 min-w-12 cursor-pointer md:min-h-5 md:min-w-5"
                            />
                            <label
                                htmlFor="is_active"
                                className="cursor-pointer text-sm font-medium text-neutral-700 select-none dark:text-neutral-300"
                            >
                                Active
                            </label>
                        </div>
                    )}
                    <div className="flex gap-2 pt-2">
                        <FormButton type="submit" loading={processing} className="flex-1">
                            {editingEmployee ? 'Update Employee' : 'Save Employee'}
                        </FormButton>
                        <FormButton
                            type="button"
                            onClick={() => {
                                setShowModal(false);
                                clearErrors();
                            }}
                            variant="secondary"
                            className="flex-1"
                        >
                            Cancel
                        </FormButton>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
