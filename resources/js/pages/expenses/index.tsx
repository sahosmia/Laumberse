import { Head, useForm, Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from "react";
import { Search, Plus, Trash2, Edit3, X, Tag } from "lucide-react";
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Expense, ExpenseCategory, Outlet, SharedData, Material } from '@/types';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';
import { SearchableSelect } from '@/components/ui/searchable-select';
import axios from 'axios';

interface ExpensesProps {
    expenses: Expense[];
    categories: ExpenseCategory[];
    outlets: Outlet[];
    materials: Material[];
}

interface EligibleEmployee {
    id: number;
    name: string;
    base_salary: number;
    already_paid: number;
    bonus: number;
    deduction: number;
    net_salary: number;
    status: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Expenses',
        href: '/expenses',
    },
];

const formatCurrency = (n: number | string) => `৳${Number(n).toLocaleString("en-BD")}`;

export default function Expenses({ expenses, categories, outlets, materials }: ExpensesProps) {
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const { settings } = usePage<SharedData>().props;
    const salaryCategoryId = settings.salary_category_id;
    const materialExpenseCategoryId = settings.material_expense_category_id;

    const { data, setData, post, put, delete: destroy, reset, errors, processing } = useForm({
        expense_category_id: '' as string | number,
        amount: '' as string | number,
        payment_method: 'Cash',
        date: new Date().toISOString().split('T')[0],
        description: '',
        outlet_id: '' as string | number,
        // Payroll fields
        employee_id: '' as string | number,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        bonus: 0,
        deduction: 0,
        deduction_note: '',
        // Material fields
        items: [] as { material_id: string | number; quantity: number; unit_price: number }[],
    });

    const [eligibleEmployees, setEligibleEmployees] = useState<EligibleEmployee[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<EligibleEmployee | null>(null);

    const isPayroll = data.expense_category_id == salaryCategoryId;
    const isMaterial = data.expense_category_id == materialExpenseCategoryId;

    useEffect(() => {
        if (isPayroll && data.month && data.year) {
            axios.get(route('employees.payroll-eligible', { month: data.month, year: data.year }))
                .then(res => setEligibleEmployees(res.data));
        }
    }, [isPayroll, data.month, data.year]);

    useEffect(() => {
        if (data.employee_id) {
            const emp = eligibleEmployees.find(e => e.id == data.employee_id);
            if (emp) {
                setSelectedEmployee(emp);
                setData(d => ({
                    ...d,
                    bonus: emp.bonus,
                    deduction: emp.deduction,
                }));
            }
        } else {
            setSelectedEmployee(null);
        }
    }, [data.employee_id, eligibleEmployees]);

    useEffect(() => {
        if (isMaterial) {
            const total = data.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unit_price)), 0);
            if (total > 0) {
                setData('amount', total);
            }
        }
    }, [data.items, isMaterial]);

    const netSalary = selectedEmployee
        ? (Number(selectedEmployee.base_salary) + Number(data.bonus) - Number(data.deduction))
        : 0;

    const filtered = expenses.filter((e) =>
        e.description?.toLowerCase().includes(search.toLowerCase()) ||
        e.category?.name.toLowerCase().includes(search.toLowerCase())
    );

    const openCreateModal = () => {
        setEditingExpense(null);
        reset();
        setShowModal(true);
    };

    const openEditModal = (expense: Expense) => {
        setEditingExpense(expense);
        setData({
            expense_category_id: expense.expense_category_id,
            amount: expense.amount,
            payment_method: expense.payment_method,
            date: expense.date,
            description: expense.description || '',
            outlet_id: expense.outlet_id || '',
            employee_id: expense.payroll?.employee_id || '',
            month: expense.payroll?.month || new Date().getMonth() + 1,
            year: expense.payroll?.year || new Date().getFullYear(),
            bonus: expense.payroll?.bonus || 0,
            deduction: expense.payroll?.deduction || 0,
            deduction_note: expense.payroll?.deduction_note || '',
            items: expense.materials?.map(m => ({
                material_id: m.material_id,
                quantity: m.quantity,
                unit_price: m.unit_price
            })) || [],
        });
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingExpense) {
            put(route('expenses.update', editingExpense.id), {
                onSuccess: () => setShowModal(false),
            });
        } else {
            post(route('expenses.store'), {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
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
            destroy(route('expenses.destroy', deleteId), {
                onSuccess: () => setShowDeleteModal(false),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Expenses" />
            <div className="p-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Expenses</h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Manage shop expenditures</p>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href={route('expense-categories.index')}
                            className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-4 py-2.5 rounded-xl text-sm font-semibold"
                        >
                            <Tag className="w-4 h-4" /> Categories
                        </Link>
                        <button
                            onClick={openCreateModal}
                            className="flex items-center gap-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg"
                        >
                            <Plus className="w-4 h-4" /> Add Expense
                        </button>
                    </div>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search expenses..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full sm:w-80 pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                    />
                </div>

                <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 text-xs uppercase tracking-wider">
                                    <th className="text-left px-5 py-3 font-semibold">Date</th>
                                    <th className="text-left px-5 py-3 font-semibold">Category</th>
                                    <th className="text-left px-5 py-3 font-semibold">Description</th>
                                    <th className="text-left px-5 py-3 font-semibold">Method</th>
                                    <th className="text-left px-5 py-3 font-semibold">Outlet</th>
                                    <th className="text-right px-5 py-3 font-semibold">Amount</th>
                                    <th className="text-center px-5 py-3 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {filtered.map((e) => (
                                    <tr key={e.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
                                        <td className="px-5 py-4 whitespace-nowrap text-neutral-600 dark:text-neutral-400">{e.date}</td>
                                        <td className="px-5 py-4">
                                            <span className="px-2 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-xs font-medium text-neutral-600 dark:text-neutral-400">
                                                {e.category?.name}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-neutral-900 dark:text-neutral-100">{e.description || '-'}</td>
                                        <td className="px-5 py-4 text-neutral-600 dark:text-neutral-400">{e.payment_method}</td>
                                        <td className="px-5 py-4 text-neutral-600 dark:text-neutral-400">{e.outlet?.name || 'Main Shop'}</td>
                                        <td className="px-5 py-4 text-right font-bold text-neutral-900 dark:text-neutral-100">{formatCurrency(Number(e.amount))}</td>
                                        <td className="px-5 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => openEditModal(e)} className="p-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-500 hover:text-blue-600 transition-colors">
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(e.id)} className="p-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-500 hover:text-red-600 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-5 py-10 text-center text-neutral-400 italic">No expenses found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete Expense"
                description="Are you sure you want to delete this expense? This action cannot be undone."
                isProcessing={processing}
            />

            {/* Expense Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{editingExpense ? 'Edit Expense' : 'New Expense'}</h3>
                            <button onClick={() => setShowModal(false)} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"><X className="w-5 h-5 text-neutral-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label htmlFor="expense_category_id" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Category</label>
                                    <select
                                        id="expense_category_id"
                                        value={data.expense_category_id}
                                        onChange={e => setData('expense_category_id', e.target.value)}
                                        className="w-full border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-sm bg-transparent dark:text-neutral-100"
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                    {errors.expense_category_id && <p className="text-xs text-red-500">{errors.expense_category_id}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label htmlFor="amount" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Amount</label>
                                    <input
                                        id="amount"
                                        type="number"
                                        value={data.amount}
                                        onChange={e => setData('amount', e.target.value)}
                                        className="w-full border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-sm bg-transparent dark:text-neutral-100 disabled:opacity-50 disabled:bg-neutral-50 dark:disabled:bg-neutral-800/50"
                                        required
                                        placeholder="0.00"
                                        readOnly={isMaterial}
                                    />
                                    {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
                                </div>
                            </div>

                            {isMaterial && (
                                <div className="space-y-3 bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Materials</h4>
                                        <button
                                            type="button"
                                            onClick={() => setData('items', [...data.items, { material_id: '', quantity: 1, unit_price: 0 }])}
                                            className="text-xs text-blue-600 font-semibold flex items-center gap-1"
                                        >
                                            <Plus className="w-3 h-3" /> Add Item
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {data.items.map((item, index) => (
                                            <div key={index} className="grid grid-cols-12 gap-2 items-start bg-white dark:bg-neutral-900 p-2 rounded-lg border border-neutral-100 dark:border-neutral-800 shadow-sm relative pr-8">
                                                <div className="col-span-6 space-y-1">
                                                    <label className="text-[10px] font-bold text-neutral-400 uppercase">Material</label>
                                                    <SearchableSelect
                                                        options={materials.map(m => ({ label: m.name, value: m.id }))}
                                                        value={item.material_id}
                                                        onChange={(val) => {
                                                            const selectedMat = materials.find(m => m.id == val);
                                                            const newItems = [...data.items];
                                                            newItems[index] = {
                                                                ...newItems[index],
                                                                material_id: val as number,
                                                                unit_price: selectedMat ? selectedMat.market_price : 0
                                                            };
                                                            setData('items', newItems);
                                                        }}
                                                        placeholder="Select"
                                                    />
                                                </div>
                                                <div className="col-span-3 space-y-1">
                                                    <label className="text-[10px] font-bold text-neutral-400 uppercase">Qty</label>
                                                    <input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => {
                                                            const newItems = [...data.items];
                                                            newItems[index].quantity = parseFloat(e.target.value) || 0;
                                                            setData('items', newItems);
                                                        }}
                                                        className="w-full border border-neutral-200 dark:border-neutral-800 rounded-lg px-2 py-1.5 text-xs bg-transparent dark:text-neutral-100"
                                                        step="0.01"
                                                    />
                                                </div>
                                                <div className="col-span-3 space-y-1">
                                                    <label className="text-[10px] font-bold text-neutral-400 uppercase">Price</label>
                                                    <input
                                                        type="number"
                                                        value={item.unit_price}
                                                        onChange={(e) => {
                                                            const newItems = [...data.items];
                                                            newItems[index].unit_price = parseFloat(e.target.value) || 0;
                                                            setData('items', newItems);
                                                        }}
                                                        className="w-full border border-neutral-200 dark:border-neutral-800 rounded-lg px-2 py-1.5 text-xs bg-transparent dark:text-neutral-100"
                                                        step="0.01"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setData('items', data.items.filter((_, i) => i !== index))}
                                                    className="absolute top-1/2 -translate-y-1/2 right-1 p-1 text-neutral-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                        {data.items.length === 0 && (
                                            <p className="text-[10px] text-center text-neutral-400 italic py-2">No items added</p>
                                        )}
                                        {errors.items && <p className="text-xs text-red-500">{errors.items}</p>}
                                    </div>
                                </div>
                            )}

                            {isPayroll && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label htmlFor="month" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Month</label>
                                            <select
                                                id="month"
                                                value={data.month}
                                                onChange={e => setData('month', parseInt(e.target.value))}
                                                className="w-full border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-sm bg-transparent dark:text-neutral-100"
                                                required
                                            >
                                                {Array.from({ length: 12 }, (_, i) => (
                                                    <option key={i + 1} value={i + 1}>
                                                        {new Date(0, i).toLocaleString('default', { month: 'long' })}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label htmlFor="year" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Year</label>
                                            <input
                                                id="year"
                                                type="number"
                                                value={data.year}
                                                onChange={e => setData('year', parseInt(e.target.value))}
                                                className="w-full border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-sm bg-transparent dark:text-neutral-100"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Employee</label>
                                        <SearchableSelect
                                            options={eligibleEmployees.map(e => ({ label: `${e.name} (Base: ${e.base_salary})`, value: e.id }))}
                                            value={data.employee_id}
                                            onChange={val => setData('employee_id', val)}
                                            placeholder="Select Employee"
                                            error={errors.employee_id}
                                        />
                                    </div>

                                    {selectedEmployee && (
                                        <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-xl space-y-3">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-neutral-500">Base Salary:</span>
                                                <span className="font-semibold text-neutral-900 dark:text-neutral-100">{formatCurrency(selectedEmployee.base_salary)}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label htmlFor="bonus" className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Bonus</label>
                                                    <input
                                                        id="bonus"
                                                        type="number"
                                                        value={data.bonus}
                                                        onChange={e => setData('bonus', parseFloat(e.target.value) || 0)}
                                                        className="w-full border border-neutral-200 dark:border-neutral-800 rounded-lg px-2 py-1.5 text-xs bg-transparent dark:text-neutral-100"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label htmlFor="deduction" className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Deduction</label>
                                                    <input
                                                        id="deduction"
                                                        type="number"
                                                        value={data.deduction}
                                                        onChange={e => setData('deduction', parseFloat(e.target.value) || 0)}
                                                        className="w-full border border-neutral-200 dark:border-neutral-800 rounded-lg px-2 py-1.5 text-xs bg-transparent dark:text-neutral-100"
                                                    />
                                                </div>
                                            </div>
                                            {data.deduction > 0 && (
                                                <div className="space-y-1">
                                                    <label htmlFor="deduction_note" className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Deduction Note</label>
                                                    <input
                                                        id="deduction_note"
                                                        type="text"
                                                        value={data.deduction_note}
                                                        onChange={e => setData('deduction_note', e.target.value)}
                                                        className="w-full border border-neutral-200 dark:border-neutral-800 rounded-lg px-2 py-1.5 text-xs bg-transparent dark:text-neutral-100"
                                                        required
                                                        placeholder="Reason for deduction"
                                                    />
                                                    {errors.deduction_note && <p className="text-xs text-red-500">{errors.deduction_note}</p>}
                                                </div>
                                            )}
                                            <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
                                                <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Net Salary:</span>
                                                <span className="text-sm font-bold text-blue-600">{formatCurrency(netSalary)}</span>
                                            </div>
                                            <div className="flex justify-between text-[10px] text-neutral-500 italic">
                                                <span>Already Paid: {formatCurrency(selectedEmployee.already_paid)}</span>
                                                <span>Remaining: {formatCurrency(netSalary - selectedEmployee.already_paid)}</span>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Date</label>
                                    <input
                                        type="date"
                                        value={data.date}
                                        onChange={e => setData('date', e.target.value)}
                                        className="w-full border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-sm bg-transparent dark:text-neutral-100"
                                        required
                                    />
                                    {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Method</label>
                                    <select
                                        value={data.payment_method}
                                        onChange={e => setData('payment_method', e.target.value)}
                                        className="w-full border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-sm bg-transparent dark:text-neutral-100"
                                        required
                                    >
                                        <option value="Cash">Cash</option>
                                        <option value="Bkash">Bkash</option>
                                        <option value="Bank">Bank</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Outlet (Optional)</label>
                                <select
                                    value={data.outlet_id}
                                    onChange={e => setData('outlet_id', e.target.value)}
                                    className="w-full border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-sm bg-transparent dark:text-neutral-100"
                                >
                                    <option value="">Main Shop</option>
                                    {outlets.map(o => (
                                        <option key={o.id} value={o.id}>{o.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Description</label>
                                <textarea
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    className="w-full border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-sm bg-transparent dark:text-neutral-100"
                                    rows={3}
                                />
                                {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {editingExpense ? 'Update Expense' : 'Save Expense'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 py-2.5 rounded-xl text-sm font-semibold"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </AppLayout>
    );
}
