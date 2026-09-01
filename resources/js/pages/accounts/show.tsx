import { DateFilterBar } from '@/components/ui/date-filter-bar';
import { LedgerTable, type LedgerColumn } from '@/components/ui/ledger-table';
import { useDateRangeFilter } from '@/hooks/use-date-range-filter';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatDate } from '@/lib/format';
import { type AccountTransaction, type BreadcrumbItem } from '@/types';
import type { AccountShowProps } from '@/types/pages/accounts';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

export default function AccountShow({ account, transactions, filters }: AccountShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Accounts', href: '/accounts' },
        { title: account.name, href: `/accounts/${account.id}` },
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
    } = useDateRangeFilter(route('accounts.show', account.id), filters);

    const columns: LedgerColumn<AccountTransaction>[] = [
        { key: 'date', label: 'Date', render: (t) => formatDate(t.created_at) },
        {
            key: 'description',
            label: 'Description',
            render: (t) => t.description || <span className="text-neutral-400 italic">No description</span>,
        },
        {
            key: 'debit',
            label: 'Debit',
            align: 'right',
            className: 'font-semibold text-red-600',
            render: (t) => (t.type === 'debit' ? formatCurrency(t.amount) : <span className="text-neutral-300 dark:text-neutral-700">—</span>),
        },
        {
            key: 'credit',
            label: 'Credit',
            align: 'right',
            className: 'font-semibold text-emerald-600',
            render: (t) => (t.type === 'credit' ? formatCurrency(t.amount) : <span className="text-neutral-300 dark:text-neutral-700">—</span>),
        },
        {
            key: 'balance',
            label: 'Balance',
            align: 'right',
            className: 'font-bold text-neutral-900 dark:text-neutral-100',
            render: (t) => formatCurrency(t.running_balance),
        },
    ];

    const renderCard = (t: AccountTransaction) => (
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{formatDate(t.created_at)}</p>
                    <p className="mt-0.5 text-sm text-neutral-700 dark:text-neutral-300">
                        {t.description || <span className="text-neutral-400 italic">No description</span>}
                    </p>
                </div>
                <p className={`shrink-0 text-sm font-semibold ${t.type === 'debit' ? 'text-red-600' : 'text-emerald-600'}`}>
                    {t.type === 'debit' ? '-' : '+'}
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
            <Head title={`Account - ${account.name}`} />

            <div className="space-y-6 p-4 md:p-6">
                <Link
                    href={route('accounts.index')}
                    className="flex items-center gap-2 text-sm text-neutral-500 transition-colors hover:text-neutral-900"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Accounts
                </Link>

                <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="border-b border-neutral-100 p-6 md:p-8 dark:border-neutral-800">
                        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                            <div className="space-y-1">
                                <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{account.name}</h1>
                                <p className="text-sm text-neutral-500">{account.account_number || 'No account number'}</p>
                            </div>
                            <div className="space-y-1 text-right">
                                <span className="text-[10px] font-bold text-neutral-400 uppercase">Current Balance</span>
                                <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{formatCurrency(account.current_balance)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Transaction History</h2>
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
        </AppLayout>
    );
}
