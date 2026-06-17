import { Head, useForm } from '@inertiajs/react';
import { useState } from "react";
import { Search, Plus, Trash2, Edit3, X, ShoppingBag } from "lucide-react";
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Material } from '@/types';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';

interface MaterialsProps {
    materials: Material[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Materials',
        href: '/materials',
    },
];

const formatCurrency = (n: number | string) => `৳${Number(n).toLocaleString("en-BD")}`;

export default function Materials({ materials }: MaterialsProps) {
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const { data, setData, post, put, delete: destroy, reset, errors, processing } = useForm({
        name: '',
        unit_price: '' as string | number,
    });

    const filtered = materials.filter((m) =>
        m.name.toLowerCase().includes(search.toLowerCase())
    );

    const openCreateModal = () => {
        setEditingMaterial(null);
        reset();
        setShowModal(true);
    };

    const openEditModal = (material: Material) => {
        setEditingMaterial(material);
        setData({
            name: material.name,
            unit_price: material.unit_price,
        });
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingMaterial) {
            put(route('materials.update', editingMaterial.id), {
                onSuccess: () => setShowModal(false),
            });
        } else {
            post(route('materials.store'), {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
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
            destroy(route('materials.destroy', deleteId), {
                onSuccess: () => setShowDeleteModal(false),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Materials" />
            <div className="p-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Materials</h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Manage raw material master data</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg"
                    >
                        <Plus className="w-4 h-4" /> Add Material
                    </button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search materials..."
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
                                    <th className="text-left px-5 py-3 font-semibold">Name</th>
                                    <th className="text-right px-5 py-3 font-semibold">Unit Price</th>
                                    <th className="text-center px-5 py-3 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {filtered.map((m) => (
                                    <tr key={m.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
                                        <td className="px-5 py-4 font-medium text-neutral-900 dark:text-neutral-100">{m.name}</td>
                                        <td className="px-5 py-4 text-right font-bold text-neutral-900 dark:text-neutral-100">{formatCurrency(m.unit_price)}</td>
                                        <td className="px-5 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => openEditModal(m)} className="p-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-500 hover:text-blue-600 transition-colors">
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(m.id)} className="p-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-500 hover:text-red-600 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-5 py-10 text-center text-neutral-400 italic">No materials found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete Material"
                description="Are you sure you want to delete this material? This action cannot be undone."
                isProcessing={processing}
            />

            {/* Material Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{editingMaterial ? 'Edit Material' : 'New Material'}</h3>
                            <button onClick={() => setShowModal(false)} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"><X className="w-5 h-5 text-neutral-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label htmlFor="name" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Material Name</label>
                                <input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="w-full border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-sm bg-transparent dark:text-neutral-100"
                                    required
                                    placeholder="e.g. Fabric A"
                                />
                                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="unit_price" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Unit Price (Base)</label>
                                <input
                                    id="unit_price"
                                    type="number"
                                    step="0.01"
                                    value={data.unit_price}
                                    onChange={e => setData('unit_price', e.target.value)}
                                    className="w-full border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-sm bg-transparent dark:text-neutral-100"
                                    required
                                    placeholder="0.00"
                                />
                                {errors.unit_price && <p className="text-xs text-red-500">{errors.unit_price}</p>}
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {editingMaterial ? 'Update Material' : 'Save Material'}
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
