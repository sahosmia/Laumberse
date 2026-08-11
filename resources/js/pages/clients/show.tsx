import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { User, Phone, MapPin, Briefcase, CreditCard, ShoppingBag, ArrowLeft, History, Settings, Tag, Edit3, Trash2 } from "lucide-react";
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';
import { CLIENT_TYPE_STYLES, type ClientType } from '@/constants/status';
import { formatCurrency } from '@/lib/format';
import type { ClientShowProps } from '@/types/pages/clients';


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
            <div className="p-4 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('clients.index')} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5 text-neutral-500" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{client.name}</h1>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                                <Tag className="w-3 h-3" /> {client.type} Client
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                         <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${typeBadgeClass(client.type)}`}>
                            {client.type}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Stats Overview */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-6 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                    <User className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-neutral-900 dark:text-neutral-100">{client.name}</h3>
                                    <p className="text-sm text-neutral-500">{client.phone}</p>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone className="w-4 h-4 text-neutral-400" />
                                    <span className="text-neutral-600 dark:text-neutral-300">{client.phone}</span>
                                </div>
                                <div className="flex items-start gap-3 text-sm">
                                    <MapPin className="w-4 h-4 text-neutral-400 mt-0.5" />
                                    <span className="text-neutral-600 dark:text-neutral-300">{client.address || 'No address provided'}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 pt-4">
                                <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-xl">
                                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                                        <ShoppingBag className="w-3 h-3" /> Total Orders
                                    </p>
                                    <p className="text-2xl font-black text-neutral-900 dark:text-neutral-100">{client.total_orders}</p>
                                </div>
                                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
                                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                                        <CreditCard className="w-3 h-3" /> Total Paid
                                    </p>
                                    <p className="text-2xl font-black text-emerald-600">{formatCurrency(Number(client.total_paid))}</p>
                                </div>
                                <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-800/50">
                                    <p className="text-[10px] text-red-600 font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                                        <Briefcase className="w-3 h-3" /> Outstanding Due
                                    </p>
                                    <p className="text-2xl font-black text-red-600">{formatCurrency(Number(client.total_due))}</p>
                                </div>
                            </div>
                        </div>

                        {client.type === 'Corporate' && (
                            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
                                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2 mb-4">
                                    <Settings className="w-4 h-4 text-purple-500" /> Custom Pricing Matrix
                                </h3>
                                <div className="space-y-3">
                                    {client.custom_prices?.map((cp, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                                            <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">{cp.product?.name}</span>
                                            <span className="text-xs font-bold text-blue-600">{formatCurrency(Number(cp.custom_price))}</span>
                                        </div>
                                    ))}
                                    {(!client.custom_prices || client.custom_prices.length === 0) && (
                                        <p className="text-xs text-neutral-400 italic text-center py-4">No custom prices configured.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Invoice History */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
                            <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                                    <History className="w-4 h-4" /> Order History
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 text-[10px] uppercase tracking-wider font-bold">
                                            <th className="text-left px-6 py-3">Invoice</th>
                                            <th className="text-left px-6 py-3">Date</th>
                                            <th className="text-right px-6 py-3">Amount</th>
                                            <th className="text-right px-6 py-3">Paid</th>
                                            <th className="text-center px-6 py-3">Payment</th>
                                            <th className="text-center px-6 py-3">Status</th>
                                            <th className="text-center px-6 py-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                        {client.invoices?.map((inv) => (
                                            <tr key={inv.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <Link href={route('invoices.show', inv.id)} className="font-mono text-xs font-bold text-blue-600 hover:underline">
                                                        {inv.invoice_uuid}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4 text-neutral-500 text-xs">{inv.date}</td>
                                                <td className="px-6 py-4 text-right font-bold text-neutral-900 dark:text-neutral-100">{formatCurrency(Number(inv.total))}</td>
                                                <td className="px-6 py-4 text-right text-emerald-600 font-medium">{formatCurrency(Number(inv.paid))}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${inv.payment_status === 'Paid'
                                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                                        : 'bg-red-50 text-red-600 border-red-200'}`}>
                                                        {inv.payment_status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                                        inv.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                                        inv.status === 'Processing' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                                        'bg-neutral-50 text-neutral-600 border-neutral-200'
                                                    }`}>
                                                        {inv.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Link href={route('invoices.edit', inv.id)} className="p-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-500 hover:text-blue-600 transition-colors">
                                                            <Edit3 className="w-4 h-4" />
                                                        </Link>
                                                        <button onClick={() => handleDeleteClick(inv.id)} className="p-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-500 hover:text-red-600 transition-colors">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {(!client.invoices || client.invoices.length === 0) && (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-10 text-center text-neutral-400 italic">No orders found for this client.</td>
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
