import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from "react";
import { Search, Plus, Trash2, Edit3, X, MapPin } from "lucide-react";
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Outlet } from '@/types';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';
import { SaveConfirmationModal } from '@/components/save-confirmation-modal';

interface OutletsProps {
    outlets: Outlet[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Outlets',
        href: '/outlets',
    },
];

export default function Outlets({ outlets }: OutletsProps) {
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingOutlet, setEditingOutlet] = useState<Outlet | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);

    useEffect(() => {
        if (showModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [showModal]);

    const { data, setData, post, put, delete: destroy, reset, errors, processing } = useForm({
        name: '',
        location: '',
    });

    const filtered = outlets.filter((o) =>
        o.name.toLowerCase().includes(search.toLowerCase()) || o.location?.toLowerCase().includes(search.toLowerCase())
    );

    const openCreateModal = () => {
        setEditingOutlet(null);
        reset();
        setShowModal(true);
    };

    const openEditModal = (outlet: Outlet) => {
        setEditingOutlet(outlet);
        setData({
            name: outlet.name,
            location: outlet.location || '',
        });
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingOutlet) {
            setShowSaveConfirm(true);
        } else {
            post(route('outlets.store'), {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
            });
        }
    };

    const confirmSave = () => {
        if (editingOutlet) {
            put(route('outlets.update', editingOutlet.id), {
                onSuccess: () => {
                    setShowSaveConfirm(false);
                    setShowModal(false);
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (deleteId) {
            destroy(route('outlets.destroy', deleteId), {
                onSuccess: () => setShowDeleteModal(false),
            });
        }
    };

    const handleBulkDelete = () => {
        setShowBulkDeleteModal(true);
    };

    const confirmBulkDelete = () => {
        router.delete(route('outlets.bulk-destroy'), {
            data: { ids: selectedIds },
            onSuccess: () => {
                setSelectedIds([]);
                setShowBulkDeleteModal(false);
            },
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filtered.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filtered.map(o => o.id));
        }
    };

    const toggleSelect = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Outlets - Laurnverse" />
            <div className="p-4 space-y-4">
                <DeleteConfirmationModal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={confirmDelete}
                    title="Delete Outlet"
                    description="Are you sure you want to delete this outlet? This action cannot be undone."
                    isProcessing={processing}
                />

                <DeleteConfirmationModal
                    isOpen={showBulkDeleteModal}
                    onClose={() => setShowBulkDeleteModal(false)}
                    onConfirm={confirmBulkDelete}
                    title={selectedIds.length > 0 ? "Delete Selected Outlets" : "Delete All Outlets"}
                    description={selectedIds.length > 0
                        ? `Are you sure you want to delete ${selectedIds.length} selected outlets?`
                        : "Are you sure you want to delete ALL outlets? This will remove every outlet from the system."}
                    isProcessing={processing}
                />

                <SaveConfirmationModal
                    isOpen={showSaveConfirm}
                    onClose={() => setShowSaveConfirm(false)}
                    onConfirm={confirmSave}
                    title="Save Outlet Changes"
                    description="Are you sure you want to save these changes to the outlet?"
                    isProcessing={processing}
                />
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Outlets</h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">{outlets.length} items</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleBulkDelete}
                            className="flex items-center gap-2 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 px-4 py-2.5 rounded-xl text-sm font-semibold border border-red-100 dark:border-red-800/50 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            {selectedIds.length > 0 ? `Delete Selected (${selectedIds.length})` : 'Delete All'}
                        </button>
                        <button
                            onClick={openCreateModal}
                            className="flex items-center gap-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg"
                        >
                            <Plus className="w-4 h-4" /> Add Outlet
                        </button>
                    </div>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search outlets..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full sm:w-80 pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                    />
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
                                    <th className="text-left px-3 py-3 font-semibold">ID</th>
                                    <th className="text-left px-3 py-3 font-semibold">Name</th>
                                    <th className="text-left px-3 py-3 font-semibold">Location</th>
                                    <th className="text-center px-3 py-3 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((o) => (
                                    <tr key={o.id} className={`border-b border-neutral-50 dark:border-neutral-800 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors ${selectedIds.includes(o.id) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                                        <td className="px-5 py-3 text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(o.id)}
                                                onChange={() => toggleSelect(o.id)}
                                                className="rounded border-neutral-300 dark:border-neutral-700 text-blue-600 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="px-3 py-3 font-mono text-xs text-neutral-500">{o.id}</td>
                                        <td className="px-3 py-3 font-medium text-neutral-800 dark:text-neutral-200">{o.name}</td>
                                        <td className="px-3 py-3">
                                            <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                                                <MapPin className="w-3.5 h-3.5" />
                                                <span>{o.location || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="flex items-center justify-center gap-1">
                                                <button onClick={() => openEditModal(o)} className="p-1.5 text-neutral-400 hover:text-blue-600"><Edit3 className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete(o.id)} className="p-1.5 text-neutral-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Outlet Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{editingOutlet ? 'Edit Outlet' : 'New Outlet'}</h3>
                            <button onClick={() => setShowModal(false)} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Outlet Name</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="w-full mt-1 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-sm bg-transparent dark:text-neutral-100"
                                    placeholder="Enter outlet name"
                                    required
                                />
                                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Location</label>
                                <input
                                    type="text"
                                    value={data.location}
                                    onChange={e => setData('location', e.target.value)}
                                    className="w-full mt-1 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-sm bg-transparent dark:text-neutral-100"
                                    placeholder="Enter physical address"
                                />
                                {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
                                >
                                    {editingOutlet ? 'Update Outlet' : 'Save Outlet'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 py-2.5 rounded-xl text-sm font-semibold"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
