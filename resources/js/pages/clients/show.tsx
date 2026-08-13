import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';
import { CLIENT_TYPE_STYLES, type ClientType } from '@/constants/status';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/format';
import { type BreadcrumbItem } from '@/types';
import type { ClientShowProps } from '@/types/pages/clients';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Briefcase, CreditCard, Edit3, History, MapPin, Phone, Settings, ShoppingBag, Tag, Trash2, User } from 'lucide-react';
import { useState } from 'react';

const typeBadgeClass = (type: ClientType) => CLIENT_TYPE_STYLES[type] ?? CLIENT_TYPE_STYLES.Consumer;

export default function ClientShow({ client }: ClientShowProps) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [invoiceToDelete, setInvoiceToDelete] = useState<number | string | null>(null);
    const { delete: destroy, processing } = useForm();

    const handleDeleteClick = (id: number | string) => {
        setInvoiceToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (invoiceToDelete) {
            destroy(route('invoices.destroy', invoiceToDelete), {
                onSuccess: () => setShowDeleteModal(false),
            });
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Clients', href: '/clients' },
        { title: client.name, href: `/clients/${client.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Client: ${client.name}`} />
            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('clients.index')}
                            className="rounded-full p-2 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        >
                            <ArrowLeft className="h-5 w-5 text-neutral-500" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{client.name}</h1>
                            <p className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                                <Tag className="h-3 w-3" /> {client.type} Client
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${typeBadgeClass(client.type)}`}>{client.type}</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Stats Overview */}
                    <div className="space-y-6 lg:col-span-1">
                        <div className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                            <div className="flex items-center gap-4">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                    <User className="h-8 w-8" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-neutral-900 dark:text-neutral-100">{client.name}</h3>
                                    <p className="font-mono text-xs font-semibold text-blue-600">{client.client_uuid}</p>
                                    <p className="text-sm text-neutral-500">{client.phone}</p>
                                </div>
                            </div>

                            <div className="space-y-4 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone className="h-4 w-4 text-neutral-400" />
                                    <span className="text-neutral-600 dark:text-neutral-300">{client.phone}</span>
                                </div>
                                <div className="flex items-start gap-3 text-sm">
                                    <MapPin className="mt-0.5 h-4 w-4 text-neutral-400" />
                                    <span className="text-neutral-600 dark:text-neutral-300">{client.address || 'No address provided'}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 pt-4">
                                <div className="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800/50">
                                    <p className="mb-1 flex items-center gap-2 text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
                                        <ShoppingBag className="h-3 w-3" /> Total Orders
                                    </p>
                                    <p className="text-2xl font-black text-neutral-900 dark:text-neutral-100">{client.total_orders}</p>
                                </div>
                                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-800/50 dark:bg-emerald-900/10">
                                    <p className="mb-1 flex items-center gap-2 text-[10px] font-bold tracking-wider text-emerald-600 uppercase">
                                        <CreditCard className="h-3 w-3" /> Total Paid
                                    </p>
                                    <p className="text-2xl font-black text-emerald-600">{formatCurrency(Number(client.total_paid))}</p>
                                </div>
                                <div className="rounded-xl border border-red-100 bg-red-50 p-4 dark:border-red-800/50 dark:bg-red-900/10">
                                    <p className="mb-1 flex items-center gap-2 text-[10px] font-bold tracking-wider text-red-600 uppercase">
                                        <Briefcase className="h-3 w-3" /> Outstanding Due
                                    </p>
                                    <p className="text-2xl font-black text-red-600">{formatCurrency(Number(client.total_due))}</p>
                                </div>
                            </div>
                        </div>

                        {client.type === 'Corporate' && (
                            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-neutral-100">
                                    <Settings className="h-4 w-4 text-purple-500" /> Custom Pricing Matrix
                                </h3>
                                <div className="space-y-3">
                                    {client.custom_prices?.map((cp, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800/50"
                                        >
                                            <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">{cp.product?.name}</span>
                                            <span className="text-xs font-bold text-blue-600">{formatCurrency(Number(cp.custom_price))}</span>
                                        </div>
                                    ))}
                                    {(!client.custom_prices || client.custom_prices.length === 0) && (
                                        <p className="py-4 text-center text-xs text-neutral-400 italic">No custom prices configured.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Invoice History */}
                    <div className="space-y-6 lg:col-span-2">
                        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                            <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-neutral-100">
                                    <History className="h-4 w-4" /> Order History
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-neutral-50 text-[10px] font-bold tracking-wider text-neutral-500 uppercase dark:bg-neutral-800/50">
                                            <th className="px-6 py-3 text-left">Invoice</th>
                                            <th className="px-6 py-3 text-left">Date</th>
                                            <th className="px-6 py-3 text-right">Amount</th>
                                            <th className="px-6 py-3 text-right">Paid</th>
                                            <th className="px-6 py-3 text-center">Payment</th>
                                            <th className="px-6 py-3 text-center">Status</th>
                                            <th className="px-6 py-3 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                        {client.invoices?.map((inv) => (
                                            <tr key={inv.id} className="group transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                                                <td className="px-6 py-4">
                                                    <Link
                                                        href={route('invoices.show', inv.id)}
                                                        className="font-mono text-xs font-bold text-blue-600 hover:underline"
                                                    >
                                                        {inv.invoice_uuid}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-neutral-500">{inv.date}</td>
                                                <td className="px-6 py-4 text-right font-bold text-neutral-900 dark:text-neutral-100">
                                                    {formatCurrency(Number(inv.total))}
                                                </td>
                                                <td className="px-6 py-4 text-right font-medium text-emerald-600">
                                                    {formatCurrency(Number(inv.paid))}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span
                                                        className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${
                                                            inv.payment_status === 'Paid'
                                                                ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                                                                : 'border-red-200 bg-red-50 text-red-600'
                                                        }`}
                                                    >
                                                        {inv.payment_status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span
                                                        className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${
                                                            inv.status === 'Delivered'
                                                                ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                                                                : inv.status === 'Processing'
                                                                  ? 'border-amber-200 bg-amber-50 text-amber-600'
                                                                  : 'border-neutral-200 bg-neutral-50 text-neutral-600'
                                                        }`}
                                                    >
                                                        {inv.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Link
                                                            href={route('invoices.edit', inv.id)}
                                                            className="rounded-lg bg-neutral-100 p-1.5 text-neutral-500 transition-colors hover:text-blue-600 dark:bg-neutral-800"
                                                        >
                                                            <Edit3 className="h-4 w-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDeleteClick(inv.id)}
                                                            className="rounded-lg bg-neutral-100 p-1.5 text-neutral-500 transition-colors hover:text-red-600 dark:bg-neutral-800"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {(!client.invoices || client.invoices.length === 0) && (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-10 text-center text-neutral-400 italic">
                                                    No orders found for this client.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete Invoice"
                description="Are you sure you want to delete this invoice? This action cannot be undone."
                isProcessing={processing}
            />
        </AppLayout>
    );
}
