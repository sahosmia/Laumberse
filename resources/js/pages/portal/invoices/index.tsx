import { Pagination } from '@/components/ui/pagination';
import { INVOICE_STATUS_STYLES, PAYMENT_STATUS_STYLES } from '@/constants/status';
import ClientPortalLayout from '@/layouts/client-portal-layout';
import { formatCurrency, formatDate } from '@/lib/format';
import type { PortalInvoicesProps } from '@/types/pages/portal';
import { Head, Link } from '@inertiajs/react';

export default function PortalInvoices({ invoices }: PortalInvoicesProps) {
    return (
        <ClientPortalLayout>
            <Head title="My Invoices" />
            <div className="space-y-4">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">My Invoices</h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">All orders placed under your account</p>
                </div>

                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-neutral-200 bg-neutral-50 text-xs tracking-wider text-neutral-500 uppercase dark:border-neutral-800 dark:bg-neutral-800/50">
                                    <th className="px-5 py-3 text-left font-semibold">Invoice</th>
                                    <th className="px-5 py-3 text-left font-semibold">Date</th>
                                    <th className="px-5 py-3 text-right font-semibold">Total</th>
                                    <th className="px-5 py-3 text-right font-semibold">Paid</th>
                                    <th className="px-5 py-3 text-center font-semibold">Payment</th>
                                    <th className="px-5 py-3 text-center font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {invoices.data.map((inv) => (
                                    <tr key={inv.id} className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                                        <td className="px-5 py-4">
                                            <Link
                                                href={route('portal.invoices.show', inv.id)}
                                                className="font-mono text-xs font-bold text-blue-600 hover:underline"
                                            >
                                                {inv.invoice_uuid}
                                            </Link>
                                        </td>
                                        <td className="px-5 py-4 text-neutral-600 dark:text-neutral-400">{formatDate(inv.date)}</td>
                                        <td className="px-5 py-4 text-right font-bold text-neutral-900 dark:text-neutral-100">
                                            {formatCurrency(Number(inv.total))}
                                        </td>
                                        <td className="px-5 py-4 text-right font-medium text-emerald-600">{formatCurrency(Number(inv.paid))}</td>
                                        <td className="px-5 py-4 text-center">
                                            <span
                                                className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${
                                                    PAYMENT_STATUS_STYLES[inv.payment_status] ?? ''
                                                }`}
                                            >
                                                {inv.payment_status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <span
                                                className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${
                                                    INVOICE_STATUS_STYLES[inv.status] ?? ''
                                                }`}
                                            >
                                                {inv.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {invoices.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-10 text-center text-neutral-400 italic">
                                            No invoices found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <Pagination links={invoices.links} />
            </div>
        </ClientPortalLayout>
    );
}
