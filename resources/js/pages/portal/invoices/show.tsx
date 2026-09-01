import { INVOICE_STATUS_STYLES, PAYMENT_STATUS_STYLES } from '@/constants/status';
import ClientPortalLayout from '@/layouts/client-portal-layout';
import { formatCurrency, formatDate } from '@/lib/format';
import type { PortalInvoiceShowProps } from '@/types/pages/portal';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

export default function PortalInvoiceShow({ invoice }: PortalInvoiceShowProps) {
    return (
        <ClientPortalLayout>
            <Head title={`Invoice ${invoice.invoice_uuid}`} />
            <div className="mx-auto max-w-3xl space-y-6">
                <Link
                    href={route('portal.invoices.index')}
                    className="flex items-center gap-2 text-sm text-neutral-500 transition-colors hover:text-neutral-900"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Invoices
                </Link>

                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="border-b border-neutral-100 p-6 dark:border-neutral-800">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <h1 className="font-mono text-lg font-bold text-neutral-900 dark:text-neutral-100">{invoice.invoice_uuid}</h1>
                                <p className="text-sm text-neutral-500">{formatDate(invoice.date)}</p>
                            </div>
                            <div className="flex gap-2">
                                <span
                                    className={`rounded-full border px-2.5 py-1 text-xs font-bold uppercase ${
                                        PAYMENT_STATUS_STYLES[invoice.payment_status] ?? ''
                                    }`}
                                >
                                    {invoice.payment_status}
                                </span>
                                <span
                                    className={`rounded-full border px-2.5 py-1 text-xs font-bold uppercase ${
                                        INVOICE_STATUS_STYLES[invoice.status] ?? ''
                                    }`}
                                >
                                    {invoice.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-neutral-50 text-[10px] font-bold tracking-wider text-neutral-500 uppercase dark:bg-neutral-800/50">
                                    <th className="px-6 py-3 text-left">Product</th>
                                    <th className="px-6 py-3 text-center">Qty</th>
                                    <th className="px-6 py-3 text-right">Price</th>
                                    <th className="px-6 py-3 text-right">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {invoice.items.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-6 py-4 font-medium text-neutral-900 dark:text-neutral-100">{item.product?.name}</td>
                                        <td className="px-6 py-4 text-center text-neutral-600 dark:text-neutral-400">{item.qty}</td>
                                        <td className="px-6 py-4 text-right text-neutral-600 dark:text-neutral-400">
                                            {formatCurrency(Number(item.price))}
                                        </td>
                                        <td className="px-6 py-4 text-right font-semibold text-neutral-900 dark:text-neutral-100">
                                            {formatCurrency(Number(item.price) * Number(item.qty))}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="space-y-2 border-t border-neutral-100 p-6 dark:border-neutral-800">
                        <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400">
                            <span>Total</span>
                            <span className="font-bold text-neutral-900 dark:text-neutral-100">{formatCurrency(Number(invoice.total))}</span>
                        </div>
                        <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400">
                            <span>Paid</span>
                            <span className="font-semibold text-emerald-600">{formatCurrency(Number(invoice.paid))}</span>
                        </div>
                        <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400">
                            <span>Due</span>
                            <span className="font-semibold text-red-600">{formatCurrency(Number(invoice.due))}</span>
                        </div>
                    </div>
                </div>
            </div>
        </ClientPortalLayout>
    );
}
