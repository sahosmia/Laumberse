import { SaveConfirmationModal } from '@/components/save-confirmation-modal';
import { TableRowActions } from '@/components/table-row-actions';
import { DataView, type DataViewColumn } from '@/components/ui/data-view';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { FilterSelect } from '@/components/ui/filter-select';
import { FormSelect } from '@/components/ui/form-select';
import { DATE_FILTERS } from '@/constants/date-filters';
import {
    INVOICE_STATUSES,
    INVOICE_STATUS_STYLES,
    PAYMENT_STATUSES,
    PAYMENT_STATUS_STYLES,
    type InvoiceStatus,
    type PaymentStatus,
} from '@/constants/status';
import { useDataViewSearch } from '@/hooks/use-data-view-search';
import { useTableLoading } from '@/hooks/use-table-loading';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatDate } from '@/lib/format';
import { Account, Invoice, type BreadcrumbItem } from '@/types';
import type { InvoiceHistoryProps } from '@/types/pages/invoices';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, CircleCheck, CircleDollarSign, CreditCard, Plus, Printer, Receipt, Zap } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Invoice History',
        href: '/invoices',
    },
];

function StatusSelect({ invoice }: { invoice: Invoice }) {
    const [loading, setLoading] = useState(false);

    const handleStatusChange = (newStatus: InvoiceStatus) => {
        if (newStatus === invoice.status) return;
        setLoading(true);
        router.patch(
            route('invoices.update-status', invoice.id),
            { status: newStatus },
            {
                onFinish: () => setLoading(false),
                preserveScroll: true,
            },
        );
    };

    return (
        <div className="relative inline-block">
            <select
                value={invoice.status}
                disabled={loading}
                onChange={(e) => handleStatusChange(e.target.value as InvoiceStatus)}
                className={`inline-flex cursor-pointer appearance-none items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-opacity focus:outline-none ${loading ? 'opacity-50' : ''} ${INVOICE_STATUS_STYLES[invoice.status] || 'border-neutral-200 bg-neutral-100 text-neutral-600'}`}
            >
                {INVOICE_STATUSES.map((s) => (
                    <option key={s} value={s}>
                        {s}
                    </option>
                ))}
            </select>
        </div>
    );
}

function PaymentStatusToggle({ invoice, accounts }: { invoice: Invoice; accounts: Pick<Account, 'id' | 'name' | 'account_number'>[] }) {
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [selectedAccountId, setSelectedAccountId] = useState<string | number>('');
    const isPaid = invoice.payment_status === 'Paid';
    const nextStatus: PaymentStatus = isPaid ? 'Unpaid' : 'Paid';
    // Only ask when there's genuinely no account tied to this invoice yet (e.g. it was created
    // fully unpaid) — an invoice that already has one keeps reusing it, same as before.
    const needsAccountPick = nextStatus === 'Paid' && !invoice.method;

    const openConfirm = () => {
        setSelectedAccountId('');
        setShowConfirm(true);
    };

    const handleConfirm = () => {
        setLoading(true);
        router.patch(
            route('invoices.update-payment-status', invoice.id),
            {
                payment_status: nextStatus,
                ...(needsAccountPick ? { account_id: selectedAccountId } : {}),
            },
            {
                onFinish: () => {
                    setLoading(false);
                    setShowConfirm(false);
                },
                preserveScroll: true,
            },
        );
    };

    const baseDescription = `Currently paid ${formatCurrency(Number(invoice.paid))}, due ${formatCurrency(Number(invoice.due))}. Marking as ${nextStatus} will set paid to ${formatCurrency(nextStatus === 'Paid' ? Number(invoice.total) : 0)} and due to ${formatCurrency(nextStatus === 'Paid' ? 0 : Number(invoice.total))}.`;
    const accountClause = needsAccountPick
        ? ' Pick which account received this payment:'
        : invoice.method
          ? ` This will ${nextStatus === 'Paid' ? `credit ${formatCurrency(Number(invoice.total))} to` : 'reverse the earlier credit from'} the "${invoice.method}" account.`
          : ' This invoice has no payment account set, so no account balance will change — edit the invoice to attach one if needed.';

    return (
        <>
            <button
                type="button"
                onClick={openConfirm}
                disabled={loading}
                title={isPaid && invoice.payment_date ? `Paid on ${formatDate(invoice.payment_date)}` : 'Mark as Paid'}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-opacity ${loading ? 'opacity-50' : ''} ${PAYMENT_STATUS_STYLES[invoice.payment_status]}`}
            >
                {isPaid ? <CircleCheck className="h-3.5 w-3.5" /> : <CircleDollarSign className="h-3.5 w-3.5" />}
                {isPaid ? 'Paid' : 'Unpaid'}
            </button>
            <SaveConfirmationModal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleConfirm}
                title={`Mark as ${nextStatus}`}
                description={baseDescription + accountClause}
                confirmText={`Mark as ${nextStatus}`}
                isProcessing={loading}
                confirmDisabled={needsAccountPick && !selectedAccountId}
            >
                {needsAccountPick && (
                    <FormSelect
                        value={selectedAccountId}
                        onChange={(e) => setSelectedAccountId(e.target.value ? Number(e.target.value) : '')}
                        autoFocus
                    >
                        <option value="">Select payment account</option>
                        {accounts.map((a) => (
                            <option key={a.id} value={a.id}>
                                {a.name}
                                {a.account_number ? ` (${a.account_number})` : ''}
                            </option>
                        ))}
                    </FormSelect>
                )}
            </SaveConfirmationModal>
        </>
    );
}

export default function InvoiceHistory({ invoices, accounts, filters }: InvoiceHistoryProps) {
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    const {
        search,
        setSearch,
        perPage,
        setPerPage,
        filterValues,
        setFilter,
        reset: resetDataView,
    } = useDataViewSearch('history', filters, {}, 'created_at:desc', 300, {
        payment_status: filters.payment_status || '',
        date_filter: filters.date_filter || '',
        specific_date: filters.specific_date || '',
    });
    const isLoading = useTableLoading();

    const isCustomRange = filterValues.date_filter === 'custom';
    const isSpecificDate = filterValues.date_filter === 'specific_date';

    const applyCustomRange = () => {
        router.get(
            route('history'),
            {
                ...(search ? { search } : {}),
                ...(filterValues.payment_status ? { payment_status: filterValues.payment_status } : {}),
                per_page: String(perPage),
                date_filter: 'custom',
                start_date: startDate || undefined,
                end_date: endDate || undefined,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleReset = () => {
        resetDataView();
        setStartDate('');
        setEndDate('');
    };

    const handlePrint = (invoice: Invoice) => {
        window.open(route('invoices.print', invoice.id), '_blank');
    };

    // POS/thermal receipt — a narrow 80mm layout (see invoices/pos.tsx) that auto-triggers the
    // print dialog on load, for printing straight to a POS receipt printer instead of the full A4
    // PDF the plain "Print" action above opens.
    const handleQuickPrint = (invoice: Invoice) => {
        window.open(route('invoices.pos-print', invoice.id), '_blank');
    };

    const columns: DataViewColumn<Invoice>[] = [
        {
            key: 'actions',
            label: 'Actions',
            align: 'center',
            render: (inv) => (
                <TableRowActions
                    id={inv.id}
                    label={`invoice ${inv.invoice_uuid}`}
                    view={{ href: route('invoices.show', inv.id) }}
                    edit={{ href: route('invoices.edit', inv.id) }}
                    deleteRoute="invoices.destroy"
                    customActions={
                        <>
                            <DropdownMenuItem onSelect={() => handlePrint(inv)}>
                                <Printer className="mr-2 h-4 w-4" /> Print
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleQuickPrint(inv)}>
                                <Zap className="mr-2 h-4 w-4" /> Quick Print
                            </DropdownMenuItem>
                        </>
                    }
                />
            ),
        },
        {
            key: 'uuid',
            label: 'Invoice UUID',
            className: 'font-mono text-xs font-semibold text-blue-600',
            render: (inv) => inv.invoice_uuid,
        },
        {
            key: 'date',
            label: 'Date',
            className: 'text-neutral-600 dark:text-neutral-400',
            render: (inv) => formatDate(inv.date),
        },
        {
            key: 'client',
            label: 'Client',
            className: 'font-medium text-neutral-800 dark:text-neutral-200',
            render: (inv) => inv.client?.name || '—',
        },
        {
            key: 'phone',
            label: 'Phone',
            className: 'text-neutral-600 dark:text-neutral-400',
            render: (inv) => inv.client?.phone || '—',
        },
        {
            key: 'total',
            label: 'Total',
            align: 'right',
            className: 'font-semibold text-neutral-900 dark:text-neutral-100',
            render: (inv) => formatCurrency(Number(inv.total)),
        },
        {
            key: 'paid',
            label: 'Paid',
            align: 'right',
            className: 'font-medium text-emerald-600',
            render: (inv) => formatCurrency(Number(inv.paid)),
        },
        {
            key: 'payment',
            label: 'Payment',
            align: 'center',
            render: (inv) => <PaymentStatusToggle invoice={inv} accounts={accounts} />,
        },
        {
            key: 'status',
            label: 'Status',
            align: 'center',
            render: (inv) => <StatusSelect invoice={inv} />,
        },
    ];

    const renderInvoiceCard = (inv: Invoice) => (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-shadow duration-300 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
            <div className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-blue-600">{inv.invoice_uuid}</span>
                    <TableRowActions
                        id={inv.id}
                        label={`invoice ${inv.invoice_uuid}`}
                        view={{ href: route('invoices.show', inv.id) }}
                        edit={{ href: route('invoices.edit', inv.id) }}
                        deleteRoute="invoices.destroy"
                        customActions={
                            <>
                                <DropdownMenuItem onSelect={() => handlePrint(inv)}>
                                    <Printer className="mr-2 h-4 w-4" /> Print
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => handleQuickPrint(inv)}>
                                    <Zap className="mr-2 h-4 w-4" /> Quick Print
                                </DropdownMenuItem>
                            </>
                        }
                    />
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20">
                        <Receipt className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate font-bold text-neutral-900 dark:text-neutral-100">{inv.client?.name || '—'}</p>
                        <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">{inv.client?.phone || '—'}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {formatDate(inv.date)} · <CreditCard className="inline h-3 w-3 -translate-y-px" /> {inv.method || 'No account set'}
                        </p>
                    </div>
                    <p className="font-bold text-neutral-900 dark:text-neutral-100">{formatCurrency(Number(inv.total))}</p>
                </div>
            </div>
            <div className="flex items-center gap-2 border-t border-neutral-100 bg-neutral-50/50 px-4 py-2.5 dark:border-neutral-800/50 dark:bg-neutral-800/20">
                <StatusSelect invoice={inv} />
                <PaymentStatusToggle invoice={inv} accounts={accounts} />
            </div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="History" />
            <div className="space-y-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                            <Receipt className="h-4 w-4" />
                        </div>
                        <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Invoice History</h1>
                    </div>
                    <Link
                        href={route('create-invoice')}
                        className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 md:min-h-10"
                    >
                        <Plus className="h-4 w-4" /> Create Invoice
                    </Link>
                </div>

                <DataView
                    data={invoices.data}
                    getKey={(inv) => inv.id}
                    loading={isLoading}
                    emptyMessage="No invoices found"
                    search={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search by client, phone, or invoice #"
                    filters={
                        <>
                            <FilterSelect
                                icon={<CircleDollarSign className="h-4 w-4" />}
                                containerClassName="w-full sm:w-48"
                                value={filterValues.payment_status ?? ''}
                                onChange={(e) => setFilter('payment_status', e.target.value)}
                            >
                                <option value="">Payment Status</option>
                                {PAYMENT_STATUSES.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </FilterSelect>
                            <FilterSelect
                                icon={<Calendar className="h-4 w-4" />}
                                containerClassName="w-full sm:w-44"
                                value={filterValues.date_filter ?? ''}
                                onChange={(e) => setFilter('date_filter', e.target.value)}
                            >
                                {DATE_FILTERS.map((f) => (
                                    <option key={f.value} value={f.value}>
                                        {f.label}
                                    </option>
                                ))}
                            </FilterSelect>
                            {isSpecificDate && (
                                <input
                                    type="date"
                                    value={filterValues.specific_date ?? ''}
                                    onChange={(e) => setFilter('specific_date', e.target.value)}
                                    className="h-9 rounded-lg border border-neutral-200 bg-transparent px-2 text-xs dark:border-neutral-800 dark:text-neutral-100"
                                />
                            )}
                            {isCustomRange && (
                                <div className="flex flex-wrap items-center gap-2 border-neutral-200 sm:border-l sm:pl-3 dark:border-neutral-800">
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="h-9 rounded-lg border border-neutral-200 bg-transparent px-2 text-xs dark:border-neutral-800 dark:text-neutral-100"
                                    />
                                    <span className="text-xs text-neutral-400">to</span>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="h-9 rounded-lg border border-neutral-200 bg-transparent px-2 text-xs dark:border-neutral-800 dark:text-neutral-100"
                                    />
                                    <button
                                        type="button"
                                        onClick={applyCustomRange}
                                        className="h-9 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
                                    >
                                        Apply
                                    </button>
                                </div>
                            )}
                        </>
                    }
                    onReset={handleReset}
                    viewKey="invoices"
                    defaultView="table"
                    columns={columns}
                    renderCard={renderInvoiceCard}
                    pagination={invoices.links}
                    total={invoices.total}
                    perPage={perPage}
                    onPerPageChange={setPerPage}
                />
            </div>
        </AppLayout>
    );
}
