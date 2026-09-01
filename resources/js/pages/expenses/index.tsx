import { SaveConfirmationModal } from '@/components/save-confirmation-modal';
import { TableRowActions } from '@/components/table-row-actions';
import { DataView, type DataViewColumn } from '@/components/ui/data-view';
import { DateFilterBar } from '@/components/ui/date-filter-bar';
import { FilterSelect } from '@/components/ui/filter-select';
import { FormButton } from '@/components/ui/form-button';
import { FormInput } from '@/components/ui/form-input';
import { FormLabel } from '@/components/ui/form-label';
import { FormSelect } from '@/components/ui/form-select';
import { Modal } from '@/components/ui/modal';
import { useDataViewSearch } from '@/hooks/use-data-view-search';
import { useTableLoading } from '@/hooks/use-table-loading';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatDate } from '@/lib/format';
import { type BreadcrumbItem, Expense, SharedData } from '@/types';
import type { EligibleEmployee, ExpensesProps } from '@/types/pages/expenses';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Plus, Receipt, Tag } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { MaterialItemsForm } from './com/MaterialItemsForm';
import { PayrollForm } from './com/PayrollForm';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Expenses',
        href: '/expenses',
    },
];

export default function Expenses({ expenses, categories, accounts, materials, filters }: ExpensesProps) {
    const [dateFilter, setDateFilter] = useState(filters.date_filter || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [specificDate, setSpecificDate] = useState(filters.specific_date || '');
    const isCustomRange = dateFilter === 'custom';
    const isSpecificDate = dateFilter === 'specific_date';
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

    const { settings, outlet } = usePage<SharedData>().props;
    const salaryCategoryId = settings.salary_category_id;
    const materialExpenseCategoryId = settings.material_expense_category_id;
    const assetPurchaseCategoryId = settings.asset_purchase_category_id;

    const { data, setData, post, put, reset, errors, processing, clearErrors } = useForm({
        expense_category_id: '' as string | number,
        amount: '' as string | number,
        account_id: '' as string | number,
        outlet_id: '' as number | '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        // Payroll fields
        employee_id: '' as string | number,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        bonus: 0,
        deduction: 0,
        deduction_note: '',
        note: '',
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

    const {
        search,
        setSearch,
        perPage,
        setPerPage,
        filterValues,
        setFilter,
        reset: resetDataView,
    } = useDataViewSearch(
        'expenses.index',
        filters,
        {
            date_filter: dateFilter,
            ...(isCustomRange ? { start_date: startDate, end_date: endDate } : {}),
            ...(isSpecificDate ? { specific_date: specificDate } : {}),
        },
        'created_at:desc',
        300,
        { category_id: filters.category_id || '' },
    );
    const isLoading = useTableLoading();

    const handleReset = () => {
        resetDataView();
        setDateFilter('');
        setStartDate('');
        setEndDate('');
        setSpecificDate('');
    };

    const openCreateModal = () => {
        setEditingExpense(null);
        reset();
        clearErrors();
        setDay(new Date().getDate());
        setMonth(new Date().getMonth() + 1);
        setYear(new Date().getFullYear());
        setShowModal(true);
    };

    useEffect(() => {
        if (new URLSearchParams(window.location.search).get('action') === 'create') {
            openCreateModal();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
            account_id: expense.account_id,
            date: expense.date,
            description: expense.description || '',
            employee_id: expense.payroll?.employee_id || '',
            month: expense.payroll?.month || new Date().getMonth() + 1,
            year: expense.payroll?.year || new Date().getFullYear(),
            bonus: expense.payroll?.bonus || 0,
            deduction: expense.payroll?.deduction || 0,
            deduction_note: expense.payroll?.deduction_note || '',
            note: expense.payroll?.note || '',
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

    const columns: DataViewColumn<Expense>[] = [
        {
            key: 'id',
            label: 'Expense ID',
            className: 'font-mono text-xs whitespace-nowrap text-neutral-400',
            render: (e) => e.unique_id || `EXP-${String(e.id).padStart(4, '0')}`,
        },
        {
            key: 'actions',
            label: 'Actions',
            align: 'center',
            render: (e) => (
                <TableRowActions
                    id={e.id}
                    label={e.description || 'expense'}
                    view={{ href: route('expenses.show', e.id) }}
                    edit={{ onClick: () => openEditModal(e) }}
                    deleteRoute="expenses.destroy"
                />
            ),
        },
        {
            key: 'date',
            label: 'Date',
            className: 'whitespace-nowrap text-neutral-600 dark:text-neutral-400',
            render: (e) => formatDate(e.date),
        },
        {
            key: 'category',
            label: 'Category',
            render: (e) => (
                <span className="rounded-md bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                    {e.category?.name}
                </span>
            ),
        },
        {
            key: 'description',
            label: 'Description',
            className: 'text-neutral-900 dark:text-neutral-100',
            render: (e) => e.description || '-',
        },
        {
            key: 'account',
            label: 'Account',
            className: 'text-neutral-600 dark:text-neutral-400',
            render: (e) => e.account?.name,
        },
        {
            key: 'amount',
            label: 'Amount',
            align: 'right',
            className: 'font-bold text-neutral-900 dark:text-neutral-100',
            render: (e) => formatCurrency(Number(e.amount)),
        },
    ];

    const renderExpenseCard = (e: Expense) => (
        <div className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 transition-all hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
            <div className="absolute top-4 right-4">
                <TableRowActions
                    id={e.id}
                    label={e.description || 'expense'}
                    view={{ href: route('expenses.show', e.id) }}
                    edit={{ onClick: () => openEditModal(e) }}
                    deleteRoute="expenses.destroy"
                />
            </div>
            <div className="mb-3 flex items-start gap-4 pr-8">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/20">
                    <Tag className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0">
                    <h4 className="truncate font-bold text-neutral-900 dark:text-neutral-100">{e.category?.name}</h4>
                    <p className="font-mono text-xs text-neutral-400">{e.unique_id || `EXP-${String(e.id).padStart(4, '0')}`}</p>
                </div>
            </div>
            {e.description && <p className="mb-3 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">{e.description}</p>}
            <div className="flex items-center justify-between border-t border-neutral-100 pt-3 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                <span>
                    {formatDate(e.date)} · {e.account?.name}
                </span>
                <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{formatCurrency(Number(e.amount))}</span>
            </div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Expenses" />
            <div className="space-y-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                            <Receipt className="h-4 w-4" />
                        </div>
                        <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Expenses</h1>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href={route('expense-categories.index')}
                            className="flex items-center gap-2 rounded-xl bg-neutral-100 px-4 py-2.5 text-sm font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                        >
                            <Tag className="h-4 w-4" /> Categories
                        </Link>
                        <FormButton onClick={openCreateModal} icon={<Plus className="h-4 w-4" />}>
                            Add Expense
                        </FormButton>
                    </div>
                </div>

                <DataView
                    data={expenses.data}
                    getKey={(e) => e.id}
                    loading={isLoading}
                    emptyMessage="No expenses found"
                    search={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search expenses..."
                    filters={
                        <>
                            <FilterSelect
                                icon={<Tag className="h-4 w-4" />}
                                containerClassName="w-full sm:w-56"
                                value={filterValues.category_id ?? ''}
                                onChange={(e) => setFilter('category_id', e.target.value)}
                            >
                                <option value="">All Categories</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </FilterSelect>
                            <DateFilterBar
                                dateFilter={dateFilter}
                                onDateFilterChange={setDateFilter}
                                isCustomRange={isCustomRange}
                                startDate={startDate}
                                onStartDateChange={setStartDate}
                                endDate={endDate}
                                onEndDateChange={setEndDate}
                                isSpecificDate={isSpecificDate}
                                specificDate={specificDate}
                                onSpecificDateChange={setSpecificDate}
                            />
                        </>
                    }
                    onReset={handleReset}
                    viewKey="expenses"
                    defaultView="table"
                    columns={columns}
                    renderCard={renderExpenseCard}
                    pagination={expenses.links}
                    total={expenses.total}
                    perPage={perPage}
                    onPerPageChange={setPerPage}
                />
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
                            <FormLabel htmlFor="expense_category_id" required>
                                Category
                            </FormLabel>
                            <FormSelect
                                id="expense_category_id"
                                value={data.expense_category_id}
                                onChange={(e) => setData('expense_category_id', Number(e.target.value))}
                                required
                            >
                                <option value="">Select Category</option>
                                {categories
                                    .filter(
                                        (c) =>
                                            editingExpense ||
                                            (Number(c.id) !== Number(salaryCategoryId) &&
                                                Number(c.id) !== Number(materialExpenseCategoryId) &&
                                                Number(c.id) !== Number(assetPurchaseCategoryId)),
                                    )
                                    .map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                            </FormSelect>
                            {errors.expense_category_id && <p className="text-xs text-red-500">{errors.expense_category_id}</p>}
                            {!editingExpense && (
                                <p className="text-xs text-neutral-400">
                                    Salary payments, material purchases, and asset purchases are now made from their own pages.
                                </p>
                            )}
                        </div>
                        {!isPayroll && (
                            <FormInput
                                id="amount"
                                label="Amount"
                                required
                                type="number"
                                value={data.amount}
                                onChange={(e) => {
                                    let val = e.target.value;
                                    if (val.length > 1 && val.startsWith('0') && val[1] !== '.') {
                                        val = val.replace(/^0+/, '');
                                    }
                                    setData('amount', val === '' ? '' : parseFloat(val));
                                }}
                                className="h-12 rounded-xl border-neutral-200 bg-transparent disabled:bg-neutral-50 disabled:opacity-50 md:h-10 dark:border-neutral-800 dark:text-neutral-100 dark:disabled:bg-neutral-800/50"
                                placeholder="0.00"
                                readOnly={isMaterial}
                                step="any"
                                error={errors.amount}
                            />
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
                            <FormLabel required>Date</FormLabel>
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
                                    <FormSelect
                                        value={month}
                                        onChange={(e) => setMonth(parseInt(e.target.value, 10))}
                                        className="px-1 text-xs"
                                        required
                                    >
                                        {Array.from({ length: 12 }, (_, i) => (
                                            <option key={i + 1} value={i + 1}>
                                                {new Date(0, i).toLocaleString('default', { month: 'short' })}
                                            </option>
                                        ))}
                                    </FormSelect>
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
                            <FormLabel required>Payment Account</FormLabel>
                            <FormSelect
                                value={data.account_id}
                                onChange={(e) => setData('account_id', e.target.value)}
                                required
                            >
                                <option value="">Select Account</option>
                                {accounts.map((a) => (
                                    <option key={a.id} value={a.id}>
                                        {a.name} {a.account_number ? `(${a.account_number})` : ''}
                                    </option>
                                ))}
                            </FormSelect>
                            {errors.account_id && <p className="text-xs text-red-500">{errors.account_id}</p>}
                        </div>
                    </div>

                    {!editingExpense && outlet?.isAll && (
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
                        <FormButton type="submit" loading={processing} className="flex-1 rounded-xl">
                            {processing ? 'Saving...' : editingExpense ? 'Update Expense' : 'Save Expense'}
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
