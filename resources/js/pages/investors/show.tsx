import { DateFilterBar } from '@/components/ui/date-filter-bar';
import { FormButton } from '@/components/ui/form-button';
import { FormInput } from '@/components/ui/form-input';
import { FormLabel } from '@/components/ui/form-label';
import { FormSelect } from '@/components/ui/form-select';
import { LedgerTable, type LedgerColumn } from '@/components/ui/ledger-table';
import { Modal } from '@/components/ui/modal';
import { INVESTOR_TRANSACTION_TYPES } from '@/constants/status';
import { useDateRangeFilter } from '@/hooks/use-date-range-filter';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatDate } from '@/lib/format';
import { type BreadcrumbItem, type InvestorTransaction, type SharedData } from '@/types';
import type { InvestorShowProps } from '@/types/pages/investors';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Plus } from 'lucide-react';
import { useState } from 'react';

export default function InvestorShow({ investor, transactions, accounts, filters }: InvestorShowProps) {
    const { outlet } = usePage<SharedData>().props;
    const [showModal, setShowModal] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Investors', href: '/investors' },
        { title: investor.name, href: `/investors/${investor.id}` },
    ];

    const { dateFilter, setDateFilter, isCustomRange, startDate, setStartDate, endDate, setEndDate, isSpecificDate, specificDate, setSpecificDate } =
        useDateRangeFilter(route('investors.show', investor.id), filters);

    const { data, setData, post, reset, errors, processing, clearErrors } = useForm({
        transaction_type: 'invest' as (typeof INVESTOR_TRANSACTION_TYPES)[number],
        account_id: '' as string | number,
        amount: '' as string | number,
        date: new Date().toISOString().slice(0, 10),
        note: '',
        outlet_id: '' as number | '',
    });

    const openModal = () => {
        reset();
        clearErrors();
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        clearErrors();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('investors.transactions.store', investor.id), {
            onSuccess: () => {
                setShowModal(false);
                reset();
            },
        });
    };

    const accountCell = (t: InvestorTransaction) =>
        t.account_name ? (
            <>
                {t.account_name}
                {t.account_number ? ` (${t.account_number})` : ''}
            </>
        ) : (
            <span className="text-neutral-400 italic">Not paid via account</span>
        );

    const columns: LedgerColumn<InvestorTransaction>[] = [
        { key: 'date', label: 'Date', render: (t) => formatDate(t.date) },
        { key: 'account', label: 'Account', render: accountCell },
        { key: 'note', label: 'Note', render: (t) => t.note || <span className="text-neutral-400 italic">No note</span> },
        {
            key: 'debit',
            label: 'Debit',
            align: 'right',
            className: 'font-semibold text-red-600',
            render: (t) =>
                t.transaction_type === 'withdraw' ? formatCurrency(t.amount) : <span className="text-neutral-300 dark:text-neutral-700">—</span>,
        },
        {
            key: 'credit',
            label: 'Credit',
            align: 'right',
            className: 'font-semibold text-emerald-600',
            render: (t) =>
                t.transaction_type === 'invest' ? formatCurrency(t.amount) : <span className="text-neutral-300 dark:text-neutral-700">—</span>,
        },
        {
            key: 'balance',
            label: 'Balance',
            align: 'right',
            className: 'font-bold text-neutral-900 dark:text-neutral-100',
            render: (t) => formatCurrency(t.running_balance),
        },
    ];

    const renderCard = (t: InvestorTransaction) => (
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{formatDate(t.date)}</p>
                    <p className="mt-0.5 text-sm text-neutral-700 dark:text-neutral-300">{accountCell(t)}</p>
                    <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
                        {t.note || <span className="text-neutral-400 italic">No note</span>}
                    </p>
                </div>
                <p className={`shrink-0 text-sm font-semibold ${t.transaction_type === 'withdraw' ? 'text-red-600' : 'text-emerald-600'}`}>
                    {t.transaction_type === 'withdraw' ? '-' : '+'}
                    {formatCurrency(t.amount)}
                </p>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-neutral-100 pt-2 text-xs dark:border-neutral-800">
                <span className="text-neutral-400">Balance</span>
                <span className="font-bold text-neutral-900 dark:text-neutral-100">{formatCurrency(t.running_balance)}</span>
            </div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Investor - ${investor.name}`} />

            <div className="space-y-6 p-4 md:p-6">
                <Link
                    href={route('investors.index')}
                    className="flex items-center gap-2 text-sm text-neutral-500 transition-colors hover:text-neutral-900"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Investors
                </Link>

                <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="border-b border-neutral-100 p-6 md:p-8 dark:border-neutral-800">
                        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                            <div className="space-y-1">
                                <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{investor.name}</h1>
                                <p className="text-sm text-neutral-500">{investor.phone || 'No phone'}</p>
                            </div>
                            <div className="space-y-1 text-right">
                                <span className="text-[10px] font-bold text-neutral-400 uppercase">Current Balance</span>
                                <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                                    {formatCurrency(investor.current_balance)}
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
                                Add Transaction
                            </FormButton>
                        </div>
                    </div>
                    <LedgerTable
                        data={transactions.data}
                        getKey={(t) => t.id}
                        columns={columns}
                        renderCard={renderCard}
                        pagination={transactions.links}
                    />
                </div>
            </div>

            <Modal isOpen={showModal} onClose={closeModal} title="Add Transaction">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormSelect
                        id="transaction_type"
                        label="Transaction Type"
                        required
                        value={data.transaction_type}
                        onChange={(e) => setData('transaction_type', e.target.value as (typeof INVESTOR_TRANSACTION_TYPES)[number])}
                        error={errors.transaction_type}
                    >
                        {INVESTOR_TRANSACTION_TYPES.map((type) => (
                            <option key={type} value={type}>
                                {type === 'invest' ? 'Invest' : 'Withdraw'}
                            </option>
                        ))}
                    </FormSelect>

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

                    {outlet?.isAll && (
                        <FormSelect
                            id="outlet_id"
                            label="Outlet"
                            required
                            value={data.outlet_id}
                            onChange={(e) => setData('outlet_id', e.target.value ? Number(e.target.value) : '')}
                            error={errors.outlet_id}
                        >
                            <option value="">Select an outlet</option>
                            {outlet.available.map((o) => (
                                <option key={o.id} value={o.id}>
                                    {o.name}
                                </option>
                            ))}
                        </FormSelect>
                    )}

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
                </form>
            </Modal>
        </AppLayout>
    );
}
