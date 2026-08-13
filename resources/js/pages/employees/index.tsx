import { SaveConfirmationModal } from '@/components/save-confirmation-modal';
import { TableRowActions } from '@/components/table-row-actions';
import { FormButton } from '@/components/ui/form-button';
import { FormInput } from '@/components/ui/form-input';
import { Modal } from '@/components/ui/modal';
import { Pagination } from '@/components/ui/pagination';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/format';
import { type BreadcrumbItem, Employee } from '@/types';
import type { EmployeesProps } from '@/types/pages/employees';
import { Head, useForm } from '@inertiajs/react';
import { Plus, Search, User } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Employees',
        href: '/employees',
    },
];

export default function Employees({ employees, filters }: EmployeesProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [showModal, setShowModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);

    const { data, setData, post, put, reset, errors, processing, clearErrors } = useForm({
        name: '',
        phone: '',
        email: '',
        designation: '',
        base_salary: '' as string | number,
        is_active: true,
    });

    useDebouncedSearch('employees.index', search);

    const openCreateModal = () => {
        setEditingEmployee(null);
        reset();
        clearErrors();
        setShowModal(true);
    };

    const openEditModal = (employee: Employee) => {
        setEditingEmployee(employee);
        clearErrors();
        setData({
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Employees" />
            <div className="space-y-4 p-4">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Employees</h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Manage shop staff</p>
                    </div>
                    <FormButton onClick={openCreateModal} icon={<Plus className="h-4 w-4" />}>
                        Add Employee
                    </FormButton>
                </div>

                <div className="relative">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search employees..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="min-h-12 w-full rounded-xl border border-neutral-200 bg-transparent py-2.5 pr-4 pl-10 text-sm text-neutral-900 transition-all focus:ring-2 focus:ring-blue-500/30 focus:outline-none sm:w-80 md:min-h-10 dark:border-neutral-800 dark:text-neutral-100"
                    />
                </div>

                {/* Desktop view */}
                <div className="hidden overflow-hidden rounded-2xl border border-neutral-200 bg-white md:block dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-neutral-50 text-xs tracking-wider text-neutral-500 uppercase dark:bg-neutral-800/50">
                                    <th className="px-5 py-3 text-left font-semibold">ID</th>
                                    <th className="px-5 py-3 text-left font-semibold">Name</th>
                                    <th className="px-5 py-3 text-left font-semibold">Designation</th>
                                    <th className="px-5 py-3 text-left font-semibold">Phone</th>
                                    <th className="px-5 py-3 text-left font-semibold">Status</th>
                                    <th className="px-5 py-3 text-right font-semibold">Base Salary</th>
                                    <th className="px-5 py-3 text-center font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {employees.data.map((e) => (
                                    <tr key={e.id} className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                                        <td className="px-5 py-4 font-mono text-xs text-neutral-400">#{e.id}</td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                                    <User className="h-4 w-4" />
                                                </div>
                                                <div className="font-medium text-neutral-900 dark:text-neutral-100">{e.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-neutral-600 dark:text-neutral-400">{e.designation}</td>
                                        <td className="px-5 py-4 text-neutral-600 dark:text-neutral-400">{e.phone}</td>
                                        <td className="px-5 py-4">
                                            <span
                                                className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase ${e.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}
                                            >
                                                {e.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right font-bold text-neutral-900 dark:text-neutral-100">
                                            {formatCurrency(e.base_salary)}
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <div className="flex items-center justify-center">
                                                <TableRowActions
                                                    id={e.id}
                                                    label={e.name}
                                                    edit={{ onClick: () => openEditModal(e) }}
                                                    deleteRoute="employees.destroy"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {employees.data.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-5 py-10 text-center text-neutral-400 italic">
                                            No employees found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile view */}
                <div className="block space-y-4 md:hidden">
                    {employees.data.map((e) => (
                        <div
                            key={e.id}
                            className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{e.name}</h4>
                                            <span className="font-mono text-[10px] text-neutral-400">#{e.id}</span>
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
                            <div className="flex justify-end border-t border-neutral-100 pt-2.5 dark:border-neutral-800">
                                <TableRowActions
                                    id={e.id}
                                    label={e.name}
                                    edit={{ onClick: () => openEditModal(e) }}
                                    deleteRoute="employees.destroy"
                                />
                            </div>
                        </div>
                    ))}
                    {employees.data.length === 0 && (
                        <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center text-neutral-400 italic dark:border-neutral-800 dark:bg-neutral-900">
                            No employees found
                        </div>
                    )}
                </div>

                <Pagination links={employees.links} />
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
                    {editingEmployee && (
                        <div className="flex items-center gap-2 py-1">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="min-h-12 min-w-12 cursor-pointer rounded border-neutral-300 md:min-h-5 md:min-w-5"
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
