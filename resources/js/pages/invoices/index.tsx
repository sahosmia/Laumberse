import { Head, Link, router } from '@inertiajs/react';
import { useState } from "react";
import { Plus, Search, Trash2, Printer, CircleDollarSign, CircleCheck } from "lucide-react";
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Invoice } from '@/types';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';
import { SaveConfirmationModal } from '@/components/save-confirmation-modal';
import { Pagination } from '@/components/ui/pagination';
import type { Paginated } from '@/types/pagination';
import { TableRowActions } from '@/components/table-row-actions';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { INVOICE_STATUSES, INVOICE_STATUS_STYLES, PAYMENT_STATUSES, PAYMENT_STATUS_STYLES, type InvoiceStatus, type PaymentStatus } from '@/constants/status';
import { DATE_FILTERS } from '@/constants/date-filters';
import { formatCurrency } from '@/lib/format';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import type { InvoiceHistoryProps } from '@/types/pages/invoices';

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
        router.patch(route('invoices.update-status', invoice.id), { status: newStatus }, {
            onFinish: () => setLoading(false),
            preserveScroll: true,
        });
    };

    return (
        <div className="relative inline-block">
            <select
                value={invoice.status}
                disabled={loading}
                onChange={(e) => handleStatusChange(e.target.value as InvoiceStatus)}
                className={`appearance-none cursor-pointer inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border focus:outline-none transition-opacity ${loading ? 'opacity-50' : ''} ${INVOICE_STATUS_STYLES[invoice.status] || "bg-neutral-100 text-neutral-600 border-neutral-200"}`}
            >
                {INVOICE_STATUSES.map(s => (
                    <option key={s} value={s}>{s}</option>
                ))}
            </select>
        </div>
    );
}

function PaymentStatusToggle({ invoice }: { invoice: Invoice }) {
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const isPaid = invoice.payment_status === 'Paid';
    const nextStatus: PaymentStatus = isPaid ? 'Unpaid' : 'Paid';

    const handleConfirm = () => {
        setLoading(true);
        router.patch(route('invoices.update-payment-status', invoice.id), {
            payment_status: nextStatus,
        }, {
            onFinish: () => {
                setLoading(false);
                setShowConfirm(false);
            },
            preserveScroll: true,
        });
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setShowConfirm(true)}
                disabled={loading}
                title={isPaid && invoice.payment_date ? `Paid on ${invoice.payment_date}` : 'Mark as Paid'}
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-opacity ${loading ? 'opacity-50' : ''} ${PAYMENT_STATUS_STYLES[invoice.payment_status]}`}
            >
                {isPaid ? <CircleCheck className="w-3.5 h-3.5" /> : <CircleDollarSign className="w-3.5 h-3.5" />}
                {isPaid ? 'Paid' : 'Unpaid'}
            </button>
            <SaveConfirmationModal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleConfirm}
                title={`Mark as ${nextStatus}`}
                description={`Currently paid ${formatCurrency(Number(invoice.paid))}, due ${formatCurrency(Number(invoice.due))}. Marking as ${nextStatus} will set paid to ${formatCurrency(nextStatus === 'Paid' ? Number(invoice.total) : 0)} and due to ${formatCurrency(nextStatus === 'Paid' ? 0 : Number(invoice.total))}.`}
                confirmText={`Mark as ${nextStatus}`}
                isProcessing={loading}
            />
        </>
    );
}

export default function InvoiceHistory({ invoices, filters }: InvoiceHistoryProps) {
    const [search, setSearch] = useState(filters.search || "");
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | ''>(filters.payment_status || "");
    const [dateFilter, setDateFilter] = useState(filters.date_filter || "");
    const [startDate, setStartDate] = useState(filters.start_date || "");
    const [endDate, setEndDate] = useState(filters.end_date || "");
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
    const [processing, setProcessing] = useState(false);

    const isCustomRange = dateFilter === 'custom';

    useDebouncedSearch('history', search, 300, {
        payment_status: paymentStatus,
        date_filter: dateFilter,
        ...(isCustomRange ? { start_date: startDate, end_date: endDate } : {}),
    });

    const handleBulkDelete = () => {
        setShowBulkDeleteModal(true);
    };

    const confirmBulkDelete = () => {
        setProcessing(true);
        router.delete(route('invoices.bulk-destroy'), {
            data: { ids: selectedIds },
            onSuccess: () => {
                setSelectedIds([]);
                setShowBulkDeleteModal(false);
            },
            onFinish: () => setProcessing(false),
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === invoices.data.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(invoices.data.map(i => i.id));
        }
    };

    const toggleSelect = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handlePrint = (invoice: Invoice) => {
        window.open(route('invoices.print', invoice.id), '_blank');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="History" />
            <div className="p-4 space-y-4">
                <DeleteConfirmationModal
                    isOpen={showBulkDeleteModal}
                    onClose={() => setShowBulkDeleteModal(false)}
                    onConfirm={confirmBulkDelete}
                    title={selectedIds.length > 0 ? "Delete Selected Invoices" : "Delete All Invoices"}
                    description={selectedIds.length > 0
                        ? `Are you sure you want to delete ${selectedIds.length} selected invoices?`
                        : "Are you sure you want to delete ALL invoices? This will remove every invoice from the system."}
                    isProcessing={processing}
                />
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Invoice History</h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">All invoices at a glance</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleBulkDelete}
                            className="flex items-center gap-2 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 px-4 py-2.5 rounded-xl text-sm font-semibold border border-red-100 dark:border-red-800/50 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            {selectedIds.length > 0 ? `Delete Selected (${selectedIds.length})` : 'Delete All'}
                        </button>
                        <Link
                            href={route('create-invoice')}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Create Invoice
                        </Link>
                    </div>
                </div>

                <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Search by client or invoice #"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                            />
                        </div>
                        <select
                            value={paymentStatus}
                            onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus | '')}
                            className="w-full sm:w-40 px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                        >
                            <option value="">All Payments</option>
                            {PAYMENT_STATUSES.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                        <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="w-full sm:w-44 px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                        >
                            {DATE_FILTERS.map(f => (
                                <option key={f.value} value={f.value}>{f.label}</option>
                            ))}
                        </select>
                        {isCustomRange && (
                            <>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full sm:w-40 px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                                />
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full sm:w-40 px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                                />
                            </>
                        )}
                    </div>
                </div>

                <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 text-xs uppercase tracking-wider">
                                    <th className="px-5 py-3 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.length === invoices.data.length && invoices.data.length > 0}
                                            onChange={toggleSelectAll}
                                            className="rounded border-neutral-300 dark:border-neutral-700 text-blue-600 focus:ring-blue-500"
                                        />
                                    </th>
                                    <th className="text-left px-3 py-3 font-semibold">Invoice UUID</th>
                                    <th className="text-left px-3 py-3 font-semibold">Date</th>
                                    <th className="text-left px-3 py-3 font-semibold">Client</th>
                                    <th className="text-right px-3 py-3 font-semibold">Total</th>
                                    <th className="text-right px-3 py-3 font-semibold">Paid</th>
                                    <th className="text-center px-3 py-3 font-semibold">Payment</th>
                                    <th className="text-center px-3 py-3 font-semibold">Status</th>
                                    <th className="text-center px-3 py-3 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.data.map((inv) => (
                                    <tr key={inv.id} className={`border-b border-neutral-50 dark:border-neutral-800 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors ${selectedIds.includes(inv.id) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                                        <td className="px-5 py-3 text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(inv.id)}
                                                onChange={() => toggleSelect(inv.id)}
                                                className="rounded border-neutral-300 dark:border-neutral-700 text-blue-600 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="px-3 py-3 font-mono text-xs font-semibold text-blue-600">{inv.invoice_uuid}</td>
                                        <td className="px-3 py-3 text-neutral-600 dark:text-neutral-400">{inv.date}</td>
                                        <td className="px-3 py-3 font-medium text-neutral-800 dark:text-neutral-200">{inv.client?.name || '—'}</td>
                                        <td className="px-3 py-3 text-right font-semibold text-neutral-900 dark:text-neutral-100">{formatCurrency(Number(inv.total))}</td>
                                        <td className="px-3 py-3 text-right text-emerald-600 font-medium">{formatCurrency(Number(inv.paid))}</td>
                                        <td className="px-3 py-3 text-center"><PaymentStatusToggle invoice={inv} /></td>
                                        <td className="px-3 py-3 text-center"><StatusSelect invoice={inv} /></td>
                                        <td className="px-3 py-3">
                                            <div className="flex items-center justify-center">
                                                <TableRowActions
                                                    id={inv.id}
                                                    label={`invoice ${inv.invoice_uuid}`}
                                                    view={{ href: route('invoices.show', inv.id) }}
                                                    edit={{ href: route('invoices.edit', inv.id) }}
                                                    deleteRoute="invoices.destroy"
                                                    customActions={
                                                        <DropdownMenuItem onSelect={() => handlePrint(inv)}>
                                                            <Printer className="w-4 h-4 mr-2" /> Print
                                                        </DropdownMenuItem>
                                                    }
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card Layout */}
                    <div className="md:hidden divide-y divide-neutral-100 dark:divide-neutral-800">
                        {invoices.data.map((inv) => (
                            <div key={inv.id} className={`p-4 space-y-3 bg-white dark:bg-neutral-900 ${selectedIds.includes(inv.id) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(inv.id)}
                                            onChange={() => toggleSelect(inv.id)}
                                            className="rounded border-neutral-300 dark:border-neutral-700 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="font-mono text-xs font-semibold text-blue-600">{inv.invoice_uuid}</span>
                                    </div>
                                    <StatusSelect invoice={inv} />
                                </div>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium text-neutral-900 dark:text-neutral-100">{inv.client?.name || '—'}</p>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">{inv.date}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-neutral-900 dark:text-neutral-100">{formatCurrency(Number(inv.total))}</p>
                                        <p className="text-xs text-emerald-600 font-medium">Paid: {formatCurrency(Number(inv.paid))}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-neutral-50 dark:border-neutral-800/50">
                                    <PaymentStatusToggle invoice={inv} />
                                </div>
                                <div className="flex items-center justify-end pt-2 border-t border-neutral-50 dark:border-neutral-800/50">
                                    <TableRowActions
                                        id={inv.id}
                                        label={`invoice ${inv.invoice_uuid}`}
                                        view={{ href: route('invoices.show', inv.id) }}
                                        edit={{ href: route('invoices.edit', inv.id) }}
                                        deleteRoute="invoices.destroy"
                                        customActions={
                                            <DropdownMenuItem onSelect={() => handlePrint(inv)}>
                                                <Printer className="w-4 h-4 mr-2" /> Print
                                            </DropdownMenuItem>
                                        }
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <Pagination links={invoices.links} />
            </div>
        </AppLayout>
    );
}








