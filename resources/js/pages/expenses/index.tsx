import { SaveConfirmationModal } from '@/components/save-confirmation-modal';
import { TableRowActions } from '@/components/table-row-actions';
import { Modal } from '@/components/ui/modal';
import { Pagination } from '@/components/ui/pagination';
import { DATE_FILTERS } from '@/constants/date-filters';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/format';
import { type BreadcrumbItem, Expense, SharedData } from '@/types';
import type { EligibleEmployee, ExpensesProps } from '@/types/pages/expenses';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Plus, Search, Tag } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { MaterialItemsForm } from './com/MaterialItemsForm';
import { PayrollForm } from './com/PayrollForm';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Expenses',
        href: '/expenses',
    },
];

export default function Expenses({ expenses, categories, materials, filters }: ExpensesProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [dateFilter, setDateFilter] = useState(filters.date_filter || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const isCustomRange = dateFilter === 'custom';
    const [showModal, setShowModal] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);

    const [day, setDay] = useState<number | ''>(new Date().getDate());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState<number | ''>(new Date().getFullYear());

    useEffect(() => {
        const formattedDay = String(day || 1).padStart(2, '0');
        const formattedMonth = String(month || 1).padStart(2, '0');
        setData('date', `${year || new Date().getFullYear()}-${formattedMonth}-${formattedDay}`);
    }, [day, month, year]);

    const { settings } = usePage<SharedData>().props;
    const salaryCategoryId = settings.salary_category_id;
    const materialExpenseCategoryId = settings.material_expense_category_id;

    const { data, setData, post, put, reset, errors, processing, clearErrors } = useForm({
        expense_category_id: '' as string | number,
        amount: '' as string | number,
        payment_method: 'Cash',
        date: new Date().toISOString().split('T')[0],
        description: '',
        // Payroll fields
        employee_id: '' as string | number,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        bonus: 0,
        deduction: 0,
        deduction_note: '',
        // Material fields
        items: [] as { material_id: string | number; quantity: number | ''; unit_price: number | '' }[],
    });

    const [eligibleEmployees, setEligibleEmployees] = useState<EligibleEmployee[]>([]);

    const isPayroll = Number(data.expense_category_id) === Number(salaryCategoryId);
    const isMaterial = Number(data.expense_category_id) === Number(materialExpenseCategoryId);

    useEffect(() => {
        if (isPayroll && data.month && data.year) {
            axios.get(route('employees.payroll-eligible', { month: data.month, year: data.year })).then((res) => {
                let list: EligibleEmployee[] = res.data;
                if (editingExpense?.payroll?.employee) {
                    const exists = list.some((e) => e.id == editingExpense.payroll?.employee_id);
                    if (!exists) {
                        const emp = editingExpense.payroll.employee;
                        const pr = editingExpense.payroll;
                        list = [
                            ...list,
                            {
                                id: emp.id,
                                name: emp.name,
                                base_salary: emp.base_salary,
                                already_paid: pr.paid_amount,
                                bonus: pr.bonus,
                                deduction: pr.deduction,
                                net_salary: pr.net_salary,
                                status: pr.status,
                            },
                        ];
                    }
                }
                setEligibleEmployees(list);
            });
        }
    }, [isPayroll, data.month, data.year, editingExpense]);

    const selectedEmployee = useMemo(() => {
        return eligibleEmployees.find((e) => e.id == data.employee_id) || null;
    }, [data.employee_id, eligibleEmployees]);

    const handleEmployeeChange = (employeeId: string | number) => {
        const emp = eligibleEmployees.find((e) => e.id == employeeId);
        setData({
            ...data,
            employee_id: employeeId,
            bonus: emp ? emp.bonus : 0,
            deduction: emp ? emp.deduction : 0,
        });
    };

    // useEffect(() => {
    //     if (isMaterial) {
    //         const total = data.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unit_price)), 0);
    //         if (total > 0) {
    //             setData('amount', total);
    //         }
    //     }
    // }, [data.items, isMaterial]);

    useEffect(() => {
        if (!isMaterial) return;

        const total = data.items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unit_price), 0);

        const roundedTotal = Math.round((total + Number.EPSILON) * 100) / 100;

        if (Number(data.amount) !== roundedTotal) {
            setData('amount', roundedTotal);
        }
    }, [data.items, isMaterial]);

    const netSalary = selectedEmployee
        ? Math.round((Number(selectedEmployee.base_salary) + Number(data.bonus) - Number(data.deduction) + Number.EPSILON) * 100) / 100
        : 0;

    useEffect(() => {
        if (!isPayroll) return;

        if (Number(data.amount) !== netSalary) {
            setData('amount', netSalary);
        }
    }, [isPayroll, netSalary]);

    useDebouncedSearch('expenses.index', search, 300, {
        date_filter: dateFilter,
        ...(isCustomRange ? { start_date: startDate, end_date: endDate } : {}),
    });

    const openCreateModal = () => {
        setEditingExpense(null);
        reset();
        clearErrors();
        setDay(new Date().getDate());
        setMonth(new Date().getMonth() + 1);
        setYear(new Date().getFullYear());
        setShowModal(true);
    };

    const openEditModal = (expense: Expense) => {
        setEditingExpense(expense);
        clearErrors();
        if (expense.date) {
            const parts = expense.date.split('-');
            if (parts.length === 3) {
                setYear(parseInt(parts[0], 10));
                setMonth(parseInt(parts[1], 10));
                setDay(parseInt(parts[2], 10));
            }
        }
        setData({
            expense_category_id: expense.expense_category_id,
            amount: expense.amount,
            payment_method: expense.payment_method,
            date: expense.date,
            description: expense.description || '',
            employee_id: expense.payroll?.employee_id || '',
            month: expense.payroll?.month || new Date().getMonth() + 1,
            year: expense.payroll?.year || new Date().getFullYear(),
            bonus: expense.payroll?.bonus || 0,
            deduction: expense.payroll?.deduction || 0,
            deduction_note: expense.payroll?.deduction_note || '',
            items:
                expense.materials?.map((m) => ({
                    material_id: m.material_id,
                    quantity: m.quantity,
                    unit_price: m.unit_price,
                    isSaved: true,
                })) || [],
        });
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingExpense) {
            setShowSaveConfirm(true);
        } else {
            post(route('expenses.store'), {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
            });
        }
    };

    const confirmSave = () => {
        if (editingExpense) {
            put(route('expenses.update', editingExpense.id), {
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
            <Head title="Expenses" />
            <div className="space-y-4 p-4">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Expenses</h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Manage shop expenditures</p>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href={route('expense-categories.index')}
                            className="flex items-center gap-2 rounded-xl bg-neutral-100 px-4 py-2.5 text-sm font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                        >
                            <Tag className="h-4 w-4" /> Categories
                        </Link>
                        <button
                            onClick={openCreateModal}
                            className="flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg dark:bg-neutral-100 dark:text-neutral-900"
                        >
                            <Plus className="h-4 w-4" /> Add Expense
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1 sm:flex-none">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Search expenses..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-xl border border-neutral-200 bg-transparent py-2.5 pr-4 pl-10 text-sm transition-all focus:ring-2 focus:ring-blue-500/30 focus:outline-none sm:w-80 dark:border-neutral-800"
                        />
                    </div>
                    <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm transition-all focus:ring-2 focus:ring-blue-500/30 focus:outline-none sm:w-44 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                    >
                        {DATE_FILTERS.map((f) => (
                            <option key={f.value} value={f.value}>
                                {f.label}
                            </option>
                        ))}
                    </select>
                    {isCustomRange && (
                        <>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm transition-all focus:ring-2 focus:ring-blue-500/30 focus:outline-none sm:w-40 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                            />
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm transition-all focus:ring-2 focus:ring-blue-500/30 focus:outline-none sm:w-40 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                            />
                        </>
                    )}
                </div>

                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px] text-sm">
                            <thead>
                                <tr className="bg-neutral-50 text-xs tracking-wider text-neutral-500 uppercase dark:bg-neutral-800/50">
                                    <th className="px-5 py-3 text-left font-semibold">Expense ID</th>
                                    <th className="px-5 py-3 text-left font-semibold">Date</th>
                                    <th className="px-5 py-3 text-left font-semibold">Category</th>
                                    <th className="px-5 py-3 text-left font-semibold">Description</th>
                                    <th className="px-5 py-3 text-left font-semibold">Method</th>
                                    <th className="px-5 py-3 text-right font-semibold">Amount</th>
                                    <th className="px-5 py-3 text-center font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {expenses.data.map((e) => (
                                    <tr key={e.id} className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                                        <td className="px-5 py-4 font-mono text-xs whitespace-nowrap text-neutral-400">
                                            {e.unique_id || `EXP-${String(e.id).padStart(4, '0')}`}
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap text-neutral-600 dark:text-neutral-400">{e.date}</td>
                                        <td className="px-5 py-4">
                                            <span className="rounded-md bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                                                {e.category?.name}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-neutral-900 dark:text-neutral-100">{e.description || '-'}</td>
                                        <td className="px-5 py-4 text-neutral-600 dark:text-neutral-400">{e.payment_method}</td>
                                        <td className="px-5 py-4 text-right font-bold text-neutral-900 dark:text-neutral-100">
                                            {formatCurrency(Number(e.amount))}
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <div className="flex items-center justify-center">
                                                <TableRowActions
                                                    id={e.id}
                                                    label={e.description || 'expense'}
                                                    view={{ href: route('expenses.show', e.id) }}
                                                    edit={{ onClick: () => openEditModal(e) }}
                                                    deleteRoute="expenses.destroy"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {expenses.data.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-5 py-10 text-center text-neutral-400 italic">
                                            No expenses found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <Pagination links={expenses.links} />
            </div>

            <SaveConfirmationModal
                isOpen={showSaveConfirm}
                onClose={() => setShowSaveConfirm(false)}
                onConfirm={confirmSave}
                title="Save Expense Changes"
                description="Are you sure you want to save these changes to the expense?"
                isProcessing={processing}
            />

            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    clearErrors();
                }}
                title={
                    editingExpense
                        ? `Edit Expense (${editingExpense.unique_id || `EXP-${String(editingExpense.id).padStart(4, '0')}`})`
                        : 'New Expense'
                }
                size="xl"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <label htmlFor="expense_category_id" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Category
                            </label>
                            <select
                                id="expense_category_id"
                                value={data.expense_category_id}
                                onChange={(e) => setData('expense_category_id', Number(e.target.value))}
                                className="h-12 w-full rounded-xl border border-neutral-200 bg-transparent px-3 text-sm md:h-10 dark:border-neutral-800 dark:text-neutral-100"
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                            {errors.expense_category_id && <p className="text-xs text-red-500">{errors.expense_category_id}</p>}
                        </div>
                        {!isPayroll && (
                            <div className="space-y-1">
                                <label htmlFor="amount" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Amount
                                </label>
                                <input
                                    id="amount"
                                    type="number"
                                    value={data.amount}
                                    onChange={(e) => {
                                        let val = e.target.value;
                                        if (val.length > 1 && val.startsWith('0') && val[1] !== '.') {
                                            val = val.replace(/^0+/, '');
                                        }
                                        setData('amount', val === '' ? '' : parseFloat(val));
                                    }}
                                    className="h-12 w-full rounded-xl border border-neutral-200 bg-transparent px-3 text-sm disabled:bg-neutral-50 disabled:opacity-50 md:h-10 dark:border-neutral-800 dark:text-neutral-100 dark:disabled:bg-neutral-800/50"
                                    required
                                    placeholder="0.00"
                                    readOnly={isMaterial}
                                    step="any"
                                />
                                {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
                            </div>
                        )}
                    </div>

                    {isMaterial && (
                        <MaterialItemsForm
                            items={data.items}
                            materials={materials}
                            errors={errors}
                            onChange={(newItems) => setData('items', newItems)}
                        />
                    )}

                    {isPayroll && (
                        <PayrollForm
                            data={data}
                            setData={setData}
                            errors={errors}
                            eligibleEmployees={eligibleEmployees}
                            selectedEmployee={selectedEmployee}
                            netSalary={netSalary}
                            formatCurrency={formatCurrency}
                            onEmployeeChange={handleEmployeeChange}
                        />
                    )}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Date</label>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                                <div>
                                    <input
                                        type="number"
                                        min="1"
                                        max="31"
                                        value={day}
                                        onChange={(e) => {
                                            let val = e.target.value;
                                            if (val.length > 1 && val.startsWith('0')) {
                                                val = val.replace(/^0+/, '');
                                            }
                                            setDay(val === '' ? '' : Math.min(31, Math.max(1, parseInt(val, 10))));
                                        }}
                                        className="h-12 w-full rounded-xl border border-neutral-200 bg-transparent px-2 text-center text-xs md:h-10 dark:border-neutral-800 dark:text-neutral-100"
                                        placeholder="Day"
                                        required
                                    />
                                </div>
                                <div>
                                    <select
                                        value={month}
                                        onChange={(e) => setMonth(parseInt(e.target.value, 10))}
                                        className="h-12 w-full rounded-xl border border-neutral-200 bg-transparent px-1 text-xs md:h-10 dark:border-neutral-800 dark:text-neutral-100"
                                        required
                                    >
                                        {Array.from({ length: 12 }, (_, i) => (
                                            <option key={i + 1} value={i + 1}>
                                                {new Date(0, i).toLocaleString('default', { month: 'short' })}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <input
                                        type="number"
                                        min="1900"
                                        max="2100"
                                        value={year}
                                        onChange={(e) => {
                                            let val = e.target.value;
                                            if (val.length > 1 && val.startsWith('0')) {
                                                val = val.replace(/^0+/, '');
                                            }
                                            setYear(val === '' ? '' : parseInt(val, 10));
                                        }}
                                        className="h-12 w-full rounded-xl border border-neutral-200 bg-transparent px-2 text-center text-xs md:h-10 dark:border-neutral-800 dark:text-neutral-100"
                                        placeholder="Year"
                                        required
                                    />
                                </div>
                            </div>
                            {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Method</label>
                            <select
                                value={data.payment_method}
                                onChange={(e) => setData('payment_method', e.target.value)}
                                className="h-12 w-full rounded-xl border border-neutral-200 bg-transparent px-3 text-sm md:h-10 dark:border-neutral-800 dark:text-neutral-100"
                                required
                            >
                                <option value="Cash">Cash</option>
                                <option value="Bkash">Bkash</option>
                                <option value="Bank">Bank</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Description</label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="w-full rounded-xl border border-neutral-200 bg-transparent px-3 py-2 text-sm dark:border-neutral-800 dark:text-neutral-100"
                            rows={3}
                        />
                        {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                        >
                            {editingExpense ? 'Update Expense' : 'Save Expense'}
                        </button>
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
