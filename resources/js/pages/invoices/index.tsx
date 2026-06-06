import { Head, Link, router } from '@inertiajs/react';
import { useState } from "react";
import { Plus, Search, Eye, Trash2, Printer, Edit } from "lucide-react";
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Invoice } from '@/types';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';

interface InvoiceHistoryProps {
    invoices: Invoice[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Invoice History',
        href: '/invoices',
    },
];

const formatCurrency = (n: number) => `৳${n.toLocaleString("en-BD")}`;

function StatusSelect({ invoice }: { invoice: Invoice }) {
    const [loading, setLoading] = useState(false);

    const handleStatusChange = (newStatus: string) => {
        if (newStatus === invoice.status) return;
        setLoading(true);
        router.patch(route('invoices.update-status', invoice.id), { status: newStatus }, {
            onFinish: () => setLoading(false),
            preserveScroll: true,
        });
    };

    const map: Record<string, string> = {
        Pending: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
        Processing: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
        "In House": "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
        Delivered: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
        Cancelled: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
    };

    return (
        <div className="relative inline-block">
            <select
                value={invoice.status}
                disabled={loading}
                onChange={(e) => handleStatusChange(e.target.value)}
                className={`appearance-none cursor-pointer inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border focus:outline-none transition-opacity ${loading ? 'opacity-50' : ''} ${map[invoice.status] || "bg-neutral-100 text-neutral-600 border-neutral-200"}`}
            >
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="In House">In House</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
            </select>
        </div>
    );
}

export default function InvoiceHistory({ invoices }: InvoiceHistoryProps) {
    const [search, setSearch] = useState("");
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
    const [processing, setProcessing] = useState(false);

    const filtered = invoices.filter((inv) =>
        inv.client.name.toLowerCase().includes(search.toLowerCase()) || inv.invoice_uuid.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = (id: number) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (deleteId) {
            setProcessing(true);
            router.delete(route('invoices.destroy', deleteId), {
                onSuccess: () => setShowDeleteModal(false),
                onFinish: () => setProcessing(false),
            });
        }
    };

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
        if (selectedIds.length === filtered.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filtered.map(i => i.id));
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
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={confirmDelete}
                    title="Delete Invoice"
                    description="Are you sure you want to delete this invoice? This action cannot be undone."
                    isProcessing={processing}
                />

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
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Search by client or invoice #"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                        />
                    </div>
                </div>

                <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 text-xs uppercase tracking-wider">
                                    <th className="px-5 py-3 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.length === filtered.length && filtered.length > 0}
                                            onChange={toggleSelectAll}
                                            className="rounded border-neutral-300 dark:border-neutral-700 text-blue-600 focus:ring-blue-500"
                                        />
                                    </th>
                                    <th className="text-left px-3 py-3 font-semibold">Invoice UUID</th>
                                    <th className="text-left px-3 py-3 font-semibold">Date</th>
                                    <th className="text-left px-3 py-3 font-semibold">Client</th>
                                    <th className="text-right px-3 py-3 font-semibold">Total</th>
                                    <th className="text-right px-3 py-3 font-semibold">Paid</th>
                                    <th className="text-right px-3 py-3 font-semibold">Due</th>
                                    <th className="text-center px-3 py-3 font-semibold">Status</th>
                                    <th className="text-center px-3 py-3 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((inv) => (
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
                                        <td className="px-3 py-3 font-medium text-neutral-800 dark:text-neutral-200">{inv.client.name}</td>
                                        <td className="px-3 py-3 text-right font-semibold text-neutral-900 dark:text-neutral-100">{formatCurrency(Number(inv.total))}</td>
                                        <td className="px-3 py-3 text-right text-emerald-600 font-medium">{formatCurrency(Number(inv.paid))}</td>
                                        <td className="px-3 py-3 text-right">
                                            <span className={`font-medium ${Number(inv.due) > 0 ? "text-red-500" : "text-neutral-400"}`}>{formatCurrency(Number(inv.due))}</span>
                                        </td>
                                        <td className="px-3 py-3 text-center"><StatusSelect invoice={inv} /></td>
                                        <td className="px-3 py-3">
                                            <div className="flex items-center justify-center gap-1">
                                                <Link href={route('invoices.show', inv.id)} className="p-1.5 text-neutral-400 hover:text-blue-600"><Eye className="w-4 h-4" /></Link>
                                                <Link href={route('invoices.edit', inv.id)} className="p-1.5 text-neutral-400 hover:text-amber-500"><Edit className="w-4 h-4" /></Link>
                                                <button onClick={() => handlePrint(inv)} className=" px-2 py-1.5 text-sm text-neutral-400 hover:text-emerald-500">
                                                    <Printer className="w-4 h-4 " />
                                                </button>

                                                <button onClick={() => handleDelete(inv.id)} className="p-1.5 text-neutral-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}








