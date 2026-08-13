import { SaveConfirmationModal } from '@/components/save-confirmation-modal';
import { Button } from '@/components/ui/button';
import type { PaymentStatus } from '@/constants/status';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/format';
import { type BreadcrumbItem } from '@/types';
import type { InvoiceDetailProps } from '@/types/pages/invoices';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Calendar, CircleCheck, CircleDollarSign, Download, Edit3, Package, Printer, User } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Invoice History', href: '/invoices' },
    { title: 'Invoice Detail', href: '#' },
];

export default function InvoiceDetail({ invoice }: InvoiceDetailProps) {
    const [togglingPayment, setTogglingPayment] = useState(false);
    const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
    const isPaid = invoice.payment_status === 'Paid';
    const nextPaymentStatus: PaymentStatus = isPaid ? 'Unpaid' : 'Paid';

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.has('print')) {
            window.print();
        }
    }, []);

    const handlePrint = () => {
        window.open(route('invoices.print', invoice.id), '_blank');
    };

    const confirmTogglePayment = () => {
        setTogglingPayment(true);
        router.patch(
            route('invoices.update-payment-status', invoice.id),
            {
                payment_status: nextPaymentStatus,
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
            <Head title={`Invoice ${invoice.id}`} />
            <div className="mx-auto max-w-4xl space-y-6 p-4">
                <div className="no-print flex items-center justify-between">
                    <Button variant="ghost" asChild>
                        <Link href={route('history')}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to History
                        </Link>
                    </Button>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            disabled={togglingPayment}
                            onClick={() => setShowPaymentConfirm(true)}
                            className={
                                isPaid
                                    ? 'border-emerald-200 text-emerald-600 hover:text-emerald-700'
                                    : 'border-red-200 text-red-600 hover:text-red-700'
                            }
                        >
                            {isPaid ? <CircleCheck className="mr-2 h-4 w-4" /> : <CircleDollarSign className="mr-2 h-4 w-4" />}
                            {isPaid ? 'Paid' : 'Mark as Paid'}
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={route('invoices.edit', invoice.id)}>
                                <Edit3 className="mr-2 h-4 w-4" /> Edit
                            </Link>
                        </Button>
                        <Button variant="outline" onClick={handlePrint}>
                            <Printer className="mr-2 h-4 w-4" /> Print
                        </Button>
                        <a href={route('invoices.print', invoice.id)} target="_blank" rel="noopener noreferrer">
                            <Button>
                                <Download className="mr-2 h-4 w-4" /> Download
                            </Button>
                        </a>
                    </div>
                </div>

                <div
                    id="invoice-content"
                    className="space-y-8 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 print:border-0 print:shadow-none"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-blue-600">INVOICE</h1>
                            <p className="mt-1 font-mono text-neutral-500">{invoice.id}</p>
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
                            <div className="space-y-1">
                                <p className="text-sm">
                                    <span className="text-neutral-500">Date:</span> <span className="font-medium">{invoice.date}</span>
                                </p>
                                <p className="text-sm">
                                    <span className="text-neutral-500">Status:</span> <span className="font-medium">{invoice.status}</span>
                                </p>
                                <p className="text-sm">
                                    <span className="text-neutral-500">Method:</span> <span className="font-medium">{invoice.method}</span>
                                </p>
                                <p className="text-sm">
                                    <span className="text-neutral-500">Payment:</span>{' '}
                                    <span className={`font-medium ${isPaid ? 'text-emerald-600' : 'text-red-500'}`}>
                                        {invoice.payment_status}
                                        {isPaid && invoice.payment_date ? ` on ${invoice.payment_date}` : ''}
                                    </span>
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

                    <div className="flex justify-end pt-8">
                        <div className="w-64 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-neutral-500">Subtotal</span>
                                <span className="font-medium">{formatCurrency(invoice.items.reduce((s, i) => s + Number(i.price) * i.qty, 0))}</span>
                            </div>
                            {(() => {
                                const subtotal = invoice.items.reduce((s, i) => s + Number(i.price) * i.qty, 0);
                                const disc = Number(invoice.discount_amount) || 0;
                                const discountValue = invoice.discount_type === 'Percentage' ? (subtotal * disc) / 100 : disc;
                                return (
                                    <div className="flex justify-between text-sm text-amber-600">
                                        <span>
                                            Discount (
                                            {invoice.discount_type === 'Percentage'
                                                ? `Percentage ${invoice.discount_amount}%`
                                                : invoice.discount_type}
                                            )
                                        </span>
                                        <span>-{formatCurrency(discountValue)}</span>
                                    </div>
                                );
                            })()}
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
                </div>

                <style
                    dangerouslySetInnerHTML={{
                        __html: `
                    @media print {
                        .no-print { display: none !important; }
                        body { background: white !important; }
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
                description={`Currently paid ${formatCurrency(Number(invoice.paid))}, due ${formatCurrency(Number(invoice.total) - Number(invoice.paid))}. Marking as ${nextPaymentStatus} will set paid to ${formatCurrency(nextPaymentStatus === 'Paid' ? Number(invoice.total) : 0)} and due to ${formatCurrency(nextPaymentStatus === 'Paid' ? 0 : Number(invoice.total))}.`}
                confirmText={`Mark as ${nextPaymentStatus}`}
                isProcessing={togglingPayment}
            />
        </AppLayout>
    );
}
