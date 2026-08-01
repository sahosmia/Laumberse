import { Head, useForm } from '@inertiajs/react';
import { useState, useEffect } from "react";
import { Search, Plus, Trash2, Edit3, X, User } from "lucide-react";
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Employee } from '@/types';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';
import { SaveConfirmationModal } from '@/components/save-confirmation-modal';
import { FormInput } from '@/components/ui/form-input';
import { FormButton } from '@/components/ui/form-button';

interface EmployeesProps {
    employees: Employee[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Employees',
        href: '/employees',
    },
];

const formatCurrency = (n: number | string) => `৳${Number(n).toLocaleString("en-BD")}`;

export default function Employees({ employees }: EmployeesProps) {
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);

    useEffect(() => {
        if (showModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [showModal]);

    const { data, setData, post, put, delete: destroy, reset, errors, processing } = useForm({
        name: '',
        phone: '',
        email: '',
        designation: '',
        base_salary: '' as string | number,
        is_active: true,
    });

    const filtered = employees.filter((e) =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.designation.toLowerCase().includes(search.toLowerCase())
    );

    const openCreateModal = () => {
        setEditingEmployee(null);
        reset();
        setShowModal(true);
    };

    const openEditModal = (employee: Employee) => {
        setEditingEmployee(employee);
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

    const handleDelete = (id: number) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (deleteId) {
            destroy(route('employees.destroy', deleteId), {
                onSuccess: () => setShowDeleteModal(false),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Employees" />
            <div className="p-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Employees</h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Manage shop staff</p>
                    </div>
                    <FormButton
                        onClick={openCreateModal}
                        icon={<Plus className="w-4 h-4" />}
                    >
                        Add Employee
                    </FormButton>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search employees..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full sm:w-80 pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all min-h-12 md:min-h-10 text-neutral-900 dark:text-neutral-100"
                    />
                </div>

                {/* Desktop view */}
                <div className="hidden md:block bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 text-xs uppercase tracking-wider">
                                    <th className="text-left px-5 py-3 font-semibold">Name</th>
                                    <th className="text-left px-5 py-3 font-semibold">Designation</th>
                                    <th className="text-left px-5 py-3 font-semibold">Phone</th>
                                    <th className="text-left px-5 py-3 font-semibold">Status</th>
                                    <th className="text-right px-5 py-3 font-semibold">Base Salary</th>
                                    <th className="text-center px-5 py-3 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {filtered.map((e) => (
                                    <tr key={e.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <div className="font-medium text-neutral-900 dark:text-neutral-100">{e.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-neutral-600 dark:text-neutral-400">{e.designation}</td>
                                        <td className="px-5 py-4 text-neutral-600 dark:text-neutral-400">{e.phone}</td>
                                        <td className="px-5 py-4">
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${e.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                {e.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right font-bold text-neutral-900 dark:text-neutral-100">{formatCurrency(e.base_salary)}</td>
                                        <td className="px-5 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => openEditModal(e)} className="p-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-500 hover:text-blue-600 transition-colors min-h-12 md:min-h-10 min-w-12 md:min-w-10 flex items-center justify-center">
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(e.id)} className="p-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-500 hover:text-red-600 transition-colors min-h-12 md:min-h-10 min-w-12 md:min-w-10 flex items-center justify-center">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-10 text-center text-neutral-400 italic">No employees found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile view */}
                <div className="block md:hidden space-y-4">
                    {filtered.map((e) => (
                        <div key={e.id} className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">{e.name}</h4>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">{e.designation}</p>
                                    </div>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${e.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                    {e.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <div className="border-t border-neutral-100 dark:border-neutral-800 pt-2.5 flex justify-between items-center text-xs">
                                <div>
                                    <p className="text-neutral-400 font-medium">Phone</p>
                                    <p className="font-semibold text-neutral-700 dark:text-neutral-300">{e.phone}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-neutral-400 font-medium">Base Salary</p>
                                    <p className="font-bold text-neutral-900 dark:text-neutral-100">{formatCurrency(e.base_salary)}</p>
                                </div>
                            </div>
                            <div className="border-t border-neutral-100 dark:border-neutral-800 pt-2.5 flex justify-end gap-2">
                                <button onClick={() => openEditModal(e)} className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-blue-600 transition-colors min-h-12 min-w-12">
                                    <Edit3 className="w-3.5 h-3.5" /> Edit
                                </button>
                                <button onClick={() => handleDelete(e.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-red-600 transition-colors min-h-12 min-w-12">
                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <div className="p-8 text-center bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-400 italic">
                            No employees found
                        </div>
                    )}
                </div>
            </div>

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete Employee"
                description="Are you sure you want to delete this employee? This action cannot be undone."
                isProcessing={processing}
            />

            <SaveConfirmationModal
                isOpen={showSaveConfirm}
                onClose={() => setShowSaveConfirm(false)}
                onConfirm={confirmSave}
                title="Save Employee Changes"
                description="Are you sure you want to save these changes to the employee?"
                isProcessing={processing}
            />

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{editingEmployee ? 'Edit Employee' : 'New Employee'}</h3>
                            <button onClick={() => setShowModal(false)} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg min-h-12 min-w-12 flex items-center justify-center"><X className="w-5 h-5 text-neutral-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <FormInput
                                label="Name"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                required
                                error={errors.name}
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormInput
                                    label="Phone"
                                    value={data.phone}
                                    onChange={e => setData('phone', e.target.value)}
                                    required
                                    error={errors.phone}
                                />
                                <FormInput
                                    label="Designation"
                                    value={data.designation}
                                    onChange={e => setData('designation', e.target.value)}
                                    required
                                    error={errors.designation}
                                />
                            </div>
                            <FormInput
                                label="Email (Optional)"
                                type="email"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                error={errors.email}
                            />
                            <FormInput
                                label="Base Salary"
                                type="number"
                                value={data.base_salary}
                                onChange={e => setData('base_salary', e.target.value)}
                                required
                                error={errors.base_salary}
                            />
                            {editingEmployee && (
                                <div className="flex items-center gap-2 py-1">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={data.is_active}
                                        onChange={e => setData('is_active', e.target.checked)}
                                        className="rounded border-neutral-300 min-h-12 min-w-12 md:min-h-5 md:min-w-5 cursor-pointer"
                                    />
                                    <label htmlFor="is_active" className="text-sm font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer select-none">Active</label>
                                </div>
                            )}
                            <div className="flex gap-2 pt-2">
                                <FormButton
                                    type="submit"
                                    loading={processing}
                                    className="flex-1"
                                >
                                    {editingEmployee ? 'Update Employee' : 'Save Employee'}
                                </FormButton>
                                <FormButton
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    variant="secondary"
                                    className="flex-1"
                                >
                                    Cancel
                                </FormButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
