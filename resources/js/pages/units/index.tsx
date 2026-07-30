import { Head, useForm } from '@inertiajs/react';
import { useState, useEffect } from "react";
import { Search, Plus, Trash2, Edit3, X } from "lucide-react";
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';
import { SaveConfirmationModal } from '@/components/save-confirmation-modal';

interface Unit {
    id: number;
    name: string;
    short_name: string;
}

interface UnitsProps {
    units: Unit[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Units',
        href: '/units',
    },
];

export default function Units({ units }: UnitsProps) {
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
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
        short_name: '',
    });

    const filtered = units.filter((u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) || u.short_name.toLowerCase().includes(search.toLowerCase())
    );

    const openCreateModal = () => {
        setEditingUnit(null);
        reset();
        setShowModal(true);
    };

    const openEditModal = (unit: Unit) => {
        setEditingUnit(unit);
        setData({
            name: unit.name,
            short_name: unit.short_name,
        });
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUnit) {
            setShowSaveConfirm(true);
        } else {
            post(route('units.store'), {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
            });
        }
    };

    const confirmSave = () => {
        if (editingUnit) {
            put(route('units.update', editingUnit.id), {
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
            destroy(route('units.destroy', deleteId), {
                onSuccess: () => setShowDeleteModal(false),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Units" />
            <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Product Units</h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">{units.length} units defined</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg"
                    >
                        <Plus className="w-4 h-4" /> Add Unit
                    </button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search units..."
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
                                    <th className="text-left px-3 py-3 font-semibold">Short Name</th>
                                    <th className="text-center px-3 py-3 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((u) => (
                                    <tr key={u.id} className="border-b border-neutral-50 dark:border-neutral-800 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                                        <td className="px-5 py-3 font-medium text-neutral-800 dark:text-neutral-200">{u.name}</td>
                                        <td className="px-3 py-3 text-neutral-600 dark:text-neutral-400 font-mono">{u.short_name}</td>
                                        <td className="px-3 py-3">
                                            <div className="flex items-center justify-center gap-1">
                                                <button onClick={() => openEditModal(u)} className="p-1.5 text-neutral-400 hover:text-blue-600"><Edit3 className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete(u.id)} className="p-1.5 text-neutral-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete Unit"
                description="Are you sure you want to delete this unit? This action cannot be undone."
                isProcessing={processing}
            />

            <SaveConfirmationModal
                isOpen={showSaveConfirm}
                onClose={() => setShowSaveConfirm(false)}
                onConfirm={confirmSave}
                title="Save Unit Changes"
                description="Are you sure you want to save these changes to the unit?"
                isProcessing={processing}
            />

            {/* Unit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{editingUnit ? 'Edit Unit' : 'New Unit'}</h3>
                            <button onClick={() => setShowModal(false)} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Unit Name</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="w-full mt-1 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-sm bg-transparent dark:text-neutral-100"
                                    placeholder="e.g. Kilogram"
                                    required
                                />
                                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Short Name</label>
                                <input
                                    type="text"
                                    value={data.short_name}
                                    onChange={e => setData('short_name', e.target.value)}
                                    className="w-full mt-1 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-sm bg-transparent dark:text-neutral-100"
                                    placeholder="e.g. kg"
                                    required
                                />
                                {errors.short_name && <p className="text-xs text-red-500 mt-1">{errors.short_name}</p>}
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
                                >
                                    {editingUnit ? 'Update Unit' : 'Save Unit'}
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
