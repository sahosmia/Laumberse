import { SaveConfirmationModal } from '@/components/save-confirmation-modal';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FormSelect } from '@/components/ui/form-select';
import { INVOICE_STATUS_STYLES, PAYMENT_STATUS_STYLES, type PaymentStatus } from '@/constants/status';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/format';
import { toWhatsAppUrl } from '@/lib/phone';
import { type BreadcrumbItem } from '@/types';
import type { InvoiceDetailProps } from '@/types/pages/invoices';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    CircleCheck,
    CircleDollarSign,
    CreditCard,
    Edit3,
    History,
    Lock,
    MessageCircle,
    Package,
    Printer,
    Receipt,
    User,
    Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const HISTORY_ACTION_LABELS: Record<string, string> = {
    created: 'Invoice created',
    updated: 'Invoice updated',
    status_changed: 'Status changed',
    payment_status_changed: 'Payment status changed',
};

export default function InvoiceDetail({ invoice, accounts, histories }: InvoiceDetailProps) {
    const [togglingPayment, setTogglingPayment] = useState(false);
    const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
    const [selectedAccountId, setSelectedAccountId] = useState<string | number>('');
    const isPaid = invoice.payment_status === 'Paid';
    const nextPaymentStatus: PaymentStatus = isPaid ? 'Unpaid' : 'Paid';
    // Only ask when there's genuinely no account tied to this invoice yet.
    const needsAccountPick = nextPaymentStatus === 'Paid' && !invoice.method;

    const subtotal = invoice.items.reduce((s, i) => s + Number(i.price) * i.qty, 0);
    const discountAmount = Number(invoice.discount_amount) || 0;
    const discountValue = invoice.discount_type === 'Percentage' ? (subtotal * discountAmount) / 100 : discountAmount;
    const due = Number(invoice.total) - Number(invoice.paid);

    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Invoice Detail', href: '#' }];

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.has('print')) {
            window.print();
        }
    }, []);

    const handlePrint = () => {
        window.open(route('invoices.print', invoice.id), '_blank');
    };

    const handleQuickPrint = () => {
        window.open(route('invoices.pos-print', invoice.id), '_blank');
    };

    const handleWhatsAppShare = () => {
        const lines = [
            `*Invoice ${invoice.invoice_uuid}*`,
            '_Launverse_',
            '',
            `*Client:* ${invoice.client.name}`,
            `*Date:* ${formatDate(invoice.date)}`,
            '',
            '*Items:*',
            ...invoice.items.map((item, i) => `${i + 1}. ${item.product.name} x${item.qty} — ${formatCurrency(Number(item.price) * item.qty)}`),
            '',
            `Subtotal: ${formatCurrency(subtotal)}`,
            ...(discountValue > 0 ? [`Discount: -${formatCurrency(discountValue)}`] : []),
            ...(invoice.client.type !== 'Corporate' && Number(invoice.delivery_charge) > 0
                ? [`Delivery: ${formatCurrency(Number(invoice.delivery_charge))}`]
                : []),
            `*Total: ${formatCurrency(Number(invoice.total))}*`,
            `Paid: ${formatCurrency(Number(invoice.paid))}`,
            `Due: ${formatCurrency(due)}`,
            `*Payment Status:* ${invoice.payment_status}`,
            '',
            'Thank you for choosing Launverse!',
        ];
        window.open(toWhatsAppUrl(invoice.client.phone, lines.join('\n')), '_blank');
    };

    const openPaymentConfirm = () => {
        setSelectedAccountId('');
        setShowPaymentConfirm(true);
    };

    const confirmTogglePayment = () => {
        setTogglingPayment(true);
        router.patch(
            route('invoices.update-payment-status', invoice.id),
            {
                payment_status: nextPaymentStatus,
                ...(needsAccountPick ? { account_id: selectedAccountId } : {}),
            },
            {
                preserveScroll: true,
                onFinish: () => {
                    setTogglingPayment(false);
                    setShowPaymentConfirm(false);
                },
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Invoice ${invoice.invoice_uuid}`} />
            <div className="space-y-4 p-4 md:p-6">
                <div className="no-print flex flex-wrap items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <Link
                            href={route('history')}
                            className="flex shrink-0 items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:hover:text-neutral-100"
                        >
                            <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Back</span>
                        </Link>
                        <div className="h-5 w-px shrink-0 bg-neutral-200 dark:bg-neutral-800" />
                        <div className="flex min-w-0 items-center gap-2.5">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                <Receipt className="h-4 w-4" />
                            </div>
                            <span className="truncate text-lg font-semibold text-neutral-900 dark:text-neutral-100">{invoice.invoice_uuid}</span>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        <Button
                            variant="outline"
                            onClick={handleWhatsAppShare}
                            className="border-emerald-200 px-3 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 sm:px-4 dark:border-emerald-800/50 dark:text-emerald-400"
                        >
                            <MessageCircle className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Share via WhatsApp</span>
                        </Button>
                        <Button variant="outline" className="px-3 sm:px-4" asChild>
                            <Link href={route('invoices.edit', invoice.id)}>
                                <Edit3 className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Edit</span>
                            </Link>
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="px-3 sm:px-4">
                                    <Printer className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Print</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onSelect={handlePrint}>
                                    <Printer className="mr-2 h-4 w-4" /> Print (PDF)
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={handleQuickPrint}>
                                    <Zap className="mr-2 h-4 w-4" /> Quick Print (POS)
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className="invoice-grid grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
                    <div
                        id="invoice-content"
                        className="space-y-8 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 print:border-0 print:shadow-none"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-blue-600">INVOICE</h1>
                                <p className="mt-1 font-mono text-neutral-500">{invoice.invoice_uuid}</p>
                            </div>
                            <div className="text-right">
                                <h2 className="text-xl font-bold">Launverse</h2>
                                <p className="text-sm text-neutral-500">Dhaka, Bangladesh</p>
                                <p className="text-sm text-neutral-500">Phone: +880 1234 567890</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 border-y border-neutral-100 py-8 dark:border-neutral-800">
                            <div className="space-y-3">
                                <h3 className="flex items-center gap-2 text-xs font-bold tracking-wider text-neutral-400 uppercase">
                                    <User className="h-3 w-3" /> Billed To
                                </h3>
                                <div>
                                    <p className="text-lg font-bold">{invoice.client.name}</p>
                                    <p className="text-neutral-600 dark:text-neutral-400">{invoice.client.phone}</p>
                                    <p className="text-neutral-600 dark:text-neutral-400">{invoice.client.address || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="space-y-3 text-right">
                                <h3 className="flex items-center justify-end gap-2 text-xs font-bold tracking-wider text-neutral-400 uppercase">
                                    <Calendar className="h-3 w-3" /> Invoice Details
                                </h3>
                                <div className="space-y-2">
                                    <p className="text-sm">
                                        <span className="text-neutral-500">Date:</span>{' '}
                                        <span className="font-medium">{formatDate(invoice.date)}</span>
                                    </p>
                                    <p className="flex items-center justify-end gap-1.5 text-sm">
                                        <span className="text-neutral-500">Status:</span>
                                        <span
                                            className={`rounded-full border px-2 py-0.5 text-xs font-bold ${INVOICE_STATUS_STYLES[invoice.status] || 'border-neutral-200 bg-neutral-100 text-neutral-600'}`}
                                        >
                                            {invoice.status}
                                        </span>
                                    </p>
                                    <p className="text-sm">
                                        <span className="text-neutral-500">Method:</span>{' '}
                                        <span className="font-medium">{invoice.method || 'Not set'}</span>
                                    </p>
                                    <p className="flex items-center justify-end gap-1.5 text-sm">
                                        <span className="text-neutral-500">Payment:</span>
                                        <span
                                            className={`rounded-full border px-2 py-0.5 text-xs font-bold ${PAYMENT_STATUS_STYLES[invoice.payment_status]}`}
                                        >
                                            {invoice.payment_status}
                                        </span>
                                        {isPaid && invoice.payment_date && (
                                            <span className="text-xs text-neutral-400">on {formatDate(invoice.payment_date)}</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="flex items-center gap-2 text-xs font-bold tracking-wider text-neutral-400 uppercase">
                                <Package className="h-3 w-3" /> Items & Services
                            </h3>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-neutral-100 text-neutral-500 dark:border-neutral-800">
                                        <th className="py-3 text-left font-semibold">Description</th>
                                        <th className="py-3 text-center font-semibold">Qty</th>
                                        <th className="py-3 text-right font-semibold">Price</th>
                                        <th className="py-3 text-right font-semibold">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800">
                                    {invoice.items.map((item) => (
                                        <tr key={item.id}>
                                            <td className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800">
                                                        {item.product.image_url ? (
                                                            <img
                                                                src={item.product.image_url}
                                                                alt={item.product.name}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center text-xs font-bold text-neutral-400 uppercase">
                                                                {item.product.name.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="font-medium">{item.product.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 text-center">{item.qty}</td>
                                            <td className="py-4 text-right">{formatCurrency(Number(item.price))}</td>
                                            <td className="py-4 text-right font-bold">{formatCurrency(Number(item.price) * item.qty)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals live in the sidebar on screen (see the Order Summary card) — this
                            print-only strip is what actually shows up on the PDF/paper copy. */}
                        <div className="hidden justify-end pt-8 print:flex">
                            <div className="w-64 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-500">Subtotal</span>
                                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-amber-600">
                                    <span>
                                        Discount (
                                        {invoice.discount_type === 'Percentage' ? `Percentage ${invoice.discount_amount}%` : invoice.discount_type})
                                    </span>
                                    <span>-{formatCurrency(discountValue)}</span>
                                </div>
                                {invoice.client.type !== 'Corporate' && (
                                    <div className="flex justify-between text-sm font-medium text-blue-600">
                                        <span>Delivery Charge</span>
                                        <span>{formatCurrency(Number(invoice.delivery_charge || 0))}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm font-medium text-emerald-600">
                                    <span>Paid</span>
                                    <span>{formatCurrency(Number(invoice.paid))}</span>
                                </div>
                                <div
                                    className={`flex justify-between border-b border-neutral-100 pb-3 text-sm font-medium dark:border-neutral-800 ${isPaid ? 'text-emerald-600' : 'text-red-500'}`}
                                >
                                    <span>Payment Status</span>
                                    <span>{invoice.payment_status}</span>
                                </div>
                                <div className="flex justify-between pt-1 text-xl font-bold text-blue-600">
                                    <span>Total</span>
                                    <span>{formatCurrency(Number(invoice.total))}</span>
                                </div>
                            </div>
                        </div>

                        {invoice.remarks && (
                            <div className="border-t border-neutral-100 pt-8 dark:border-neutral-800">
                                <h3 className="mb-2 text-xs font-bold tracking-wider text-neutral-400 uppercase">Remarks</h3>
                                <p className="text-sm text-neutral-600 italic dark:text-neutral-400">{invoice.remarks}</p>
                            </div>
                        )}

                        {invoice.internal_note && (
                            <div className="no-print border-t border-neutral-100 pt-8 dark:border-neutral-800">
                                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 dark:border-amber-900/40 dark:bg-amber-900/10">
                                    <h3 className="mb-1 flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-amber-700 uppercase dark:text-amber-500">
                                        <Lock className="h-3 w-3" /> Internal Note (staff only)
                                    </h3>
                                    <p className="text-sm whitespace-pre-line text-neutral-700 dark:text-neutral-300">{invoice.internal_note}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="no-print space-y-4 lg:sticky lg:top-4 lg:self-start">
                        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-5 text-white shadow-lg shadow-blue-500/25">
                            <h3 className="mb-4 flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-blue-100 uppercase">
                                <Receipt className="h-3 w-3" /> Order Summary
                            </h3>

                            <div className="space-y-1.5 text-sm text-blue-100">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span className="text-white">{formatCurrency(subtotal)}</span>
                                </div>
                                {discountValue > 0 && (
                                    <div className="flex justify-between">
                                        <span>
                                            Discount ({invoice.discount_type === 'Percentage' ? `${invoice.discount_amount}%` : invoice.discount_type}
                                            )
                                        </span>
                                        <span className="text-amber-300">-{formatCurrency(discountValue)}</span>
                                    </div>
                                )}
                                {invoice.client.type !== 'Corporate' && Number(invoice.delivery_charge) > 0 && (
                                    <div className="flex justify-between">
                                        <span>Delivery Charge</span>
                                        <span className="text-white">{formatCurrency(Number(invoice.delivery_charge))}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 rounded-xl bg-white/10 p-3.5 backdrop-blur-sm">
                                <div className="flex items-baseline justify-between">
                                    <span className="text-xs font-semibold text-blue-100 uppercase">Total</span>
                                    <span className="text-2xl font-bold">{formatCurrency(Number(invoice.total))}</span>
                                </div>
                            </div>

                            <div className="mt-3 grid grid-cols-2 gap-2">
                                <div className="rounded-xl bg-white/10 p-2.5 text-center">
                                    <p className="text-sm font-bold text-emerald-300">{formatCurrency(Number(invoice.paid))}</p>
                                    <p className="text-[9px] font-medium tracking-wider text-blue-100 uppercase">Paid</p>
                                </div>
                                <div className="rounded-xl bg-white/10 p-2.5 text-center">
                                    <p className="text-sm font-bold text-red-300">{formatCurrency(due)}</p>
                                    <p className="text-[9px] font-medium tracking-wider text-blue-100 uppercase">Due</p>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                                <span className="text-xs font-medium text-blue-100">Payment Status</span>
                                <span
                                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${isPaid ? 'bg-emerald-400/20 text-emerald-300' : 'bg-red-400/20 text-red-300'}`}
                                >
                                    {invoice.payment_status}
                                </span>
                            </div>
                            <Button
                                variant="outline"
                                disabled={togglingPayment}
                                onClick={openPaymentConfirm}
                                className="mt-3 w-full border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                            >
                                {isPaid ? <CircleCheck className="mr-2 h-4 w-4" /> : <CircleDollarSign className="mr-2 h-4 w-4" />}
                                {isPaid ? 'Mark as Unpaid' : 'Mark as Paid'}
                            </Button>
                        </div>

                        <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                            <h3 className="mb-3 text-[10px] font-bold tracking-wider text-neutral-400 uppercase">Payment Method</h3>
                            <div className="space-y-1.5 text-sm text-neutral-600 dark:text-neutral-400">
                                <p className="flex items-center gap-1.5">
                                    <CreditCard className="h-3.5 w-3.5 flex-shrink-0 text-neutral-400" /> {invoice.method || 'No account set'}
                                </p>
                                {isPaid && invoice.payment_date && (
                                    <p className="flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-neutral-400" /> Paid on {formatDate(invoice.payment_date)}
                                    </p>
                                )}
                            </div>
                        </div>

                        {histories.length > 0 && (
                            <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                                <h3 className="mb-4 flex items-center gap-2 text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                                    <History className="h-3.5 w-3.5" /> Edit History
                                </h3>
                                <div className="max-h-[28rem] space-y-4 overflow-y-auto pr-1">
                                    {histories.map((h) => (
                                        <div key={h.id} className="border-l-2 border-neutral-100 pl-3 dark:border-neutral-800">
                                            <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                                                {HISTORY_ACTION_LABELS[h.action] ?? h.action}
                                                {h.user ? ` by ${h.user.name}` : ''}
                                            </p>
                                            <p className="text-xs text-neutral-400">{formatDateTime(h.created_at)}</p>
                                            {!!h.changes?.fields.length && (
                                                <ul className="mt-1.5 space-y-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                                                    {h.changes.fields.map((c, i) => (
                                                        <li key={i}>
                                                            <span className="font-medium text-neutral-600 dark:text-neutral-300">{c.label}:</span>{' '}
                                                            {c.old ?? '—'} → {c.new ?? '—'}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                            {!!h.changes?.items.length && (
                                                <ul className="mt-1.5 space-y-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                                                    {h.changes.items.map((line, i) => (
                                                        <li key={i}>{line}</li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <style
                    dangerouslySetInnerHTML={{
                        __html: `
                    @media print {
                        .no-print { display: none !important; }
                        body { background: white !important; }
                        .invoice-grid { display: block !important; }
                        #invoice-content { border: 0 !important; box-shadow: none !important; padding: 0 !important; }
                    }
                `,
                    }}
                />
            </div>

            <SaveConfirmationModal
                isOpen={showPaymentConfirm}
                onClose={() => setShowPaymentConfirm(false)}
                onConfirm={confirmTogglePayment}
                title={`Mark as ${nextPaymentStatus}`}
                description={
                    `Currently paid ${formatCurrency(Number(invoice.paid))}, due ${formatCurrency(due)}. Marking as ${nextPaymentStatus} will set paid to ${formatCurrency(nextPaymentStatus === 'Paid' ? Number(invoice.total) : 0)} and due to ${formatCurrency(nextPaymentStatus === 'Paid' ? 0 : Number(invoice.total))}.` +
                    (needsAccountPick ? ' Pick which account received this payment:' : '')
                }
                confirmText={`Mark as ${nextPaymentStatus}`}
                isProcessing={togglingPayment}
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
        </AppLayout>
    );
}
