import { DateFilterBar } from '@/components/ui/date-filter-bar';
import { FormButton } from '@/components/ui/form-button';
import { FormInput } from '@/components/ui/form-input';
import { FormLabel } from '@/components/ui/form-label';
import { FormSelect } from '@/components/ui/form-select';
import { LedgerTable, type LedgerColumn } from '@/components/ui/ledger-table';
import { Modal } from '@/components/ui/modal';
import { EMPLOYEE_TRANSACTION_TYPE_LABELS, EMPLOYEE_TRANSACTION_TYPE_STYLES, EMPLOYEE_TRANSACTION_TYPES } from '@/constants/status';
import { useDateRangeFilter } from '@/hooks/use-date-range-filter';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatDate } from '@/lib/format';
import { type BreadcrumbItem, type EmployeeLedgerEntry } from '@/types';
import type { EmployeeShowProps } from '@/types/pages/employees';
import { Head, Link, useForm } from '@inertiajs/react';
import axios from 'axios';
import { ArrowLeft, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

type PaymentType = (typeof EMPLOYEE_TRANSACTION_TYPES)[number] | 'salary';

export default function EmployeeShow({ employee, transactions, accounts, filters }: EmployeeShowProps) {
    const [showModal, setShowModal] = useState(false);
    const [paymentType, setPaymentType] = useState<PaymentType>('advance');
    const [payrollAlreadyPaid, setPayrollAlreadyPaid] = useState(0);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Employees', href: '/employees' },
        { title: employee.name, href: `/employees/${employee.id}` },
    ];

    const {
        dateFilter,
        setDateFilter,
        isCustomRange,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        isSpecificDate,
        specificDate,
        setSpecificDate,
    } = useDateRangeFilter(route('employees.show', employee.id), filters);

    const { data, setData, post, reset, errors, processing, clearErrors } = useForm({
        transaction_type: 'advance' as (typeof EMPLOYEE_TRANSACTION_TYPES)[number],
        account_id: '' as string | number,
        amount: '' as string | number,
        date: new Date().toISOString().slice(0, 10),
        note: '',
    });

    const {
        data: payrollData,
        setData: setPayrollData,
        post: postPayroll,
        reset: resetPayroll,
        errors: payrollErrors,
        processing: payrollProcessing,
        clearErrors: clearPayrollErrors,
    } = useForm({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        bonus: 0 as number | '',
        deduction: 0 as number | '',
        deduction_note: '',
        account_id: '' as string | number,
        date: new Date().toISOString().slice(0, 10),
    });

    const openModal = () => {
        setPaymentType('advance');
        reset();
        clearErrors();
        resetPayroll();
        clearPayrollErrors();
        setPayrollAlreadyPaid(0);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        clearErrors();
        clearPayrollErrors();
    };

    // Pre-fills bonus/deduction (and shows what's already been paid) if this employee already has
    // a payroll started for the selected month/year — reuses the same eligibility endpoint the
    // Expenses page uses, just filtered down to this one employee.
    useEffect(() => {
        if (!showModal || paymentType !== 'salary') return;

        axios.get(route('employees.payroll-eligible', { month: payrollData.month, year: payrollData.year })).then((res) => {
            const match = (res.data as { id: number; bonus: number; deduction: number; already_paid: number }[]).find(
                (e) => e.id === employee.id,
            );
            setPayrollAlreadyPaid(match?.already_paid ?? 0);
            if (match) {
                setPayrollData((prev) => ({ ...prev, bonus: match.bonus, deduction: match.deduction }));
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showModal, paymentType, payrollData.month, payrollData.year]);

    const netSalary =
        Math.round((Number(employee.base_salary) + Number(payrollData.bonus || 0) - Number(payrollData.deduction || 0) + Number.EPSILON) * 100) /
        100;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (paymentType === 'salary') {
            postPayroll(route('employees.payroll.store', employee.id), {
                onSuccess: () => {
                    setShowModal(false);
                    resetPayroll();
                },
            });
        } else {
            post(route('employees.transactions.store', employee.id), {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
            });
        }
    };

    const accountCell = (t: EmployeeLedgerEntry) => (
        <>
            {t.account_name}
            {t.account_number ? ` (${t.account_number})` : ''}
        </>
    );

    const noteCell = (t: EmployeeLedgerEntry) => (
        <>
            <span className={`mr-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${EMPLOYEE_TRANSACTION_TYPE_STYLES[t.type]}`}>
                {EMPLOYEE_TRANSACTION_TYPE_LABELS[t.type]}
            </span>
            {t.note || <span className="text-neutral-400 italic">No note</span>}
        </>
    );

    const balanceCell = (t: EmployeeLedgerEntry) =>
        t.source === 'salary' ? (
            <span className="font-normal text-neutral-400" title="Salary doesn't affect the advance/loan balance">
                {formatCurrency(t.running_balance)}
            </span>
        ) : (
            formatCurrency(t.running_balance)
        );

    const columns: LedgerColumn<EmployeeLedgerEntry>[] = [
        { key: 'date', label: 'Date', render: (t) => formatDate(t.date) },
        { key: 'account', label: 'Account', render: accountCell },
        { key: 'note', label: 'Note', render: noteCell },
        {
            key: 'debit',
            label: 'Debit',
            align: 'right',
            className: 'font-semibold text-red-600',
            render: (t) => (t.type === 'loan_return' ? formatCurrency(t.amount) : <span className="text-neutral-300 dark:text-neutral-700">—</span>),
        },
        {
            key: 'credit',
            label: 'Credit',
            align: 'right',
            className: 'font-semibold text-emerald-600',
            render: (t) => (t.type !== 'loan_return' ? formatCurrency(t.amount) : <span className="text-neutral-300 dark:text-neutral-700">—</span>),
        },
        {
            key: 'balance',
            label: 'Balance',
            align: 'right',
            className: 'font-bold text-neutral-900 dark:text-neutral-100',
            render: balanceCell,
        },
    ];

    const renderCard = (t: EmployeeLedgerEntry) => (
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{formatDate(t.date)}</p>
                    <p className="mt-0.5 text-sm text-neutral-700 dark:text-neutral-300">{accountCell(t)}</p>
                </div>
                <p className={`shrink-0 text-sm font-semibold ${t.type === 'loan_return' ? 'text-red-600' : 'text-emerald-600'}`}>
                    {t.type === 'loan_return' ? '-' : '+'}
                    {formatCurrency(t.amount)}
                </p>
            </div>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">{noteCell(t)}</p>
            <div className="mt-2 flex items-center justify-between border-t border-neutral-100 pt-2 text-xs dark:border-neutral-800">
                <span className="text-neutral-400">Balance</span>
                <span className="font-bold text-neutral-900 dark:text-neutral-100">{balanceCell(t)}</span>
            </div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Employee - ${employee.name}`} />

            <div className="space-y-6 p-4 md:p-6">
                <Link
                    href={route('employees.index')}
                    className="flex items-center gap-2 text-sm text-neutral-500 transition-colors hover:text-neutral-900"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Employees
                </Link>

                <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="border-b border-neutral-100 p-6 md:p-8 dark:border-neutral-800">
                        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                            <div className="space-y-1">
                                <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{employee.name}</h1>
                                <p className="text-sm text-neutral-500">
                                    {employee.designation} &middot; {employee.phone}
                                </p>
                                <p className="text-xs text-neutral-400">Base Salary: {formatCurrency(employee.base_salary)}</p>
                            </div>
                            <div className="space-y-1 text-right">
                                <span className="text-[10px] font-bold text-neutral-400 uppercase">Outstanding Balance</span>
                                <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                                    {formatCurrency(employee.current_balance)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Transaction History</h2>
                        <div className="flex flex-wrap items-center gap-2">
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
                            <FormButton onClick={openModal} icon={<Plus className="h-4 w-4" />}>
                                New Payment
                            </FormButton>
                        </div>
                    </div>
                    <LedgerTable
                        data={transactions.data}
                        getKey={(t) => `${t.source}-${t.id}`}
                        columns={columns}
                        renderCard={renderCard}
                        pagination={transactions.links}
                    />
                </div>
            </div>

            <Modal isOpen={showModal} onClose={closeModal} title="New Payment">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormSelect
                        id="payment_type"
                        label="Payment Type"
                        required
                        value={paymentType}
                        onChange={(e) => {
                            const type = e.target.value as PaymentType;
                            setPaymentType(type);
                            if (type !== 'salary') setData('transaction_type', type);
                        }}
                    >
                        {EMPLOYEE_TRANSACTION_TYPES.map((type) => (
                            <option key={type} value={type}>
                                {EMPLOYEE_TRANSACTION_TYPE_LABELS[type]}
                            </option>
                        ))}
                        <option value="salary">{EMPLOYEE_TRANSACTION_TYPE_LABELS.salary}</option>
                    </FormSelect>

                    {paymentType === 'salary' ? (
                        <>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <FormLabel htmlFor="payroll_month" required>
                                        Month
                                    </FormLabel>
                                    <FormSelect
                                        id="payroll_month"
                                        value={payrollData.month}
                                        onChange={(e) => setPayrollData('month', parseInt(e.target.value, 10))}
                                        required
                                    >
                                        {Array.from({ length: 12 }, (_, i) => (
                                            <option key={i + 1} value={i + 1}>
                                                {new Date(0, i).toLocaleString('default', { month: 'long' })}
                                            </option>
                                        ))}
                                    </FormSelect>
                                </div>
                                <FormInput
                                    id="payroll_year"
                                    label="Year"
                                    type="number"
                                    required
                                    value={payrollData.year}
                                    onChange={(e) => setPayrollData('year', parseInt(e.target.value, 10) || new Date().getFullYear())}
                                    className="rounded-xl border-neutral-200 bg-transparent dark:border-neutral-800 dark:text-neutral-100"
                                    error={payrollErrors.year}
                                />
                            </div>

                            {payrollAlreadyPaid > 0 && (
                                <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                                    Already paid {formatCurrency(payrollAlreadyPaid)} for this month.
                                </p>
                            )}

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <FormInput
                                    id="payroll_bonus"
                                    label="Bonus"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={payrollData.bonus}
                                    onChange={(e) => setPayrollData('bonus', e.target.value === '' ? '' : parseFloat(e.target.value))}
                                    className="rounded-xl border-neutral-200 bg-transparent dark:border-neutral-800 dark:text-neutral-100"
                                    placeholder="0.00"
                                    error={payrollErrors.bonus}
                                />
                                <FormInput
                                    id="payroll_deduction"
                                    label="Deduction"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={payrollData.deduction}
                                    onChange={(e) => setPayrollData('deduction', e.target.value === '' ? '' : parseFloat(e.target.value))}
                                    className="rounded-xl border-neutral-200 bg-transparent dark:border-neutral-800 dark:text-neutral-100"
                                    placeholder="0.00"
                                    error={payrollErrors.deduction}
                                />
                            </div>

                            {Number(payrollData.deduction) > 0 && (
                                <div className="space-y-1.5">
                                    <FormLabel htmlFor="payroll_deduction_note" required>
                                        Deduction Note
                                    </FormLabel>
                                    <textarea
                                        id="payroll_deduction_note"
                                        value={payrollData.deduction_note}
                                        onChange={(e) => setPayrollData('deduction_note', e.target.value)}
                                        className="w-full rounded-xl border border-neutral-200 bg-transparent px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                        rows={2}
                                        placeholder="Why is this being deducted?"
                                    />
                                    {payrollErrors.deduction_note && <p className="text-xs text-red-500">{payrollErrors.deduction_note}</p>}
                                </div>
                            )}

                            <div className="rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800/50">
                                <p className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase">Net Salary</p>
                                <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{formatCurrency(netSalary)}</p>
                            </div>

                            <FormSelect
                                id="payroll_account_id"
                                label="Payment Account"
                                required
                                value={payrollData.account_id}
                                onChange={(e) => setPayrollData('account_id', e.target.value)}
                                error={payrollErrors.account_id}
                            >
                                <option value="">Select Account</option>
                                {accounts.map((a) => (
                                    <option key={a.id} value={a.id}>
                                        {a.name} {a.account_number ? `(${a.account_number})` : ''}
                                    </option>
                                ))}
                            </FormSelect>

                            <FormInput
                                id="payroll_date"
                                label="Date"
                                type="date"
                                required
                                value={payrollData.date}
                                onChange={(e) => setPayrollData('date', e.target.value)}
                                className="rounded-xl border-neutral-200 bg-transparent dark:border-neutral-800 dark:text-neutral-100"
                                error={payrollErrors.date}
                            />

                            <div className="flex gap-2 pt-2">
                                <FormButton type="submit" loading={payrollProcessing} className="flex-1 rounded-xl">
                                    {payrollProcessing ? 'Paying...' : 'Pay Salary'}
                                </FormButton>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 rounded-xl bg-neutral-100 py-2.5 text-sm font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <FormSelect
                                id="account_id"
                                label="Payment Account"
                                required
                                value={data.account_id}
                                onChange={(e) => setData('account_id', e.target.value)}
                                error={errors.account_id}
                            >
                                <option value="">Select Account</option>
                                {accounts.map((a) => (
                                    <option key={a.id} value={a.id}>
                                        {a.name} {a.account_number ? `(${a.account_number})` : ''}
                                    </option>
                                ))}
                            </FormSelect>

                            <FormInput
                                id="amount"
                                label="Amount"
                                type="number"
                                step="0.01"
                                min="0.01"
                                required
                                value={data.amount}
                                onChange={(e) => setData('amount', e.target.value)}
                                className="rounded-xl border-neutral-200 bg-transparent dark:border-neutral-800 dark:text-neutral-100"
                                placeholder="0.00"
                                error={errors.amount}
                            />

                            <FormInput
                                id="date"
                                label="Date"
                                type="date"
                                required
                                value={data.date}
                                onChange={(e) => setData('date', e.target.value)}
                                className="rounded-xl border-neutral-200 bg-transparent dark:border-neutral-800 dark:text-neutral-100"
                                error={errors.date}
                            />

                            <div className="space-y-1.5">
                                <FormLabel htmlFor="note">Note</FormLabel>
                                <textarea
                                    id="note"
                                    value={data.note}
                                    onChange={(e) => setData('note', e.target.value)}
                                    className="w-full rounded-xl border border-neutral-200 bg-transparent px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                    rows={3}
                                />
                                {errors.note && <p className="text-xs text-red-500">{errors.note}</p>}
                            </div>

                            <div className="flex gap-2 pt-2">
                                <FormButton type="submit" loading={processing} className="flex-1 rounded-xl">
                                    {processing ? 'Saving...' : 'Save Transaction'}
                                </FormButton>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 rounded-xl bg-neutral-100 py-2.5 text-sm font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </Modal>
        </AppLayout>
    );
}
