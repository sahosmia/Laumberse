import { Head, useForm } from '@inertiajs/react';
import { useState } from "react";
import { Search, Plus } from "lucide-react";
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Material } from '@/types';
import { SaveConfirmationModal } from '@/components/save-confirmation-modal';
import { Modal } from '@/components/ui/modal';
import { Pagination } from '@/components/ui/pagination';
import { TableRowActions } from '@/components/table-row-actions';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import type { MaterialsProps } from '@/types/pages/materials';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Materials',
        href: '/materials',
    },
];

export default function Materials({ materials, units, filters }: MaterialsProps) {
    const [search, setSearch] = useState(filters.search || "");
    const [showModal, setShowModal] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);

    const { data, setData, post, put, reset, errors, processing, clearErrors } = useForm({
        name: '',
        unit_id: '' as string | number,
    });

    useDebouncedSearch('materials.index', search);

    const openCreateModal = () => {
        setEditingMaterial(null);
        reset();
        clearErrors();
        setShowModal(true);
    };

    const openEditModal = (material: Material) => {
        setEditingMaterial(material);
        clearErrors();
        setData({
            name: material.name,
            unit_id: material.unit_id || '',
        });
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingMaterial) {
            setShowSaveConfirm(true);
        } else {
            post(route('materials.store'), {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
            });
        }
    };

    const confirmSave = () => {
        if (editingMaterial) {
            put(route('materials.update', editingMaterial.id), {
                onSuccess: () => {
                    setShowSaveConfirm(false);
                    setShowModal(false);
                },
                onError: () => {
                    setShowSaveConfirm(false);
                },
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
                        className="flex items-center gap-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg animate-fade-in"
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

                {/* Desktop view */}
                <div className="hidden md:block bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 text-xs uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-800">
                                    <th className="text-left px-5 py-3 font-semibold">Name</th>
                                    <th className="text-left px-5 py-3 font-semibold">Unit</th>
                                    <th className="text-center px-5 py-3 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {materials.data.map((m) => (
                                    <tr key={m.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
                                        <td className="px-5 py-4 font-medium text-neutral-900 dark:text-neutral-100">{m.name}</td>
                                        <td className="px-5 py-4 text-neutral-600 dark:text-neutral-400">
                                            {m.unit ? `${m.unit.name} (${m.unit.short_name})` : <span className="text-neutral-400 italic">None</span>}
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <div className="flex items-center justify-center">
                                                <TableRowActions
                                                    id={m.id}
                                                    label={m.name}
                                                    edit={{ onClick: () => openEditModal(m) }}
                                                    deleteRoute="materials.destroy"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {materials.data.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-5 py-10 text-center text-neutral-400 italic">No materials found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile view */}
                <div className="block md:hidden space-y-4">
                    {materials.data.map((m) => (
                        <div key={m.id} className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-3">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">{m.name}</h4>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                        Unit: {m.unit ? `${m.unit.name} (${m.unit.short_name})` : <span className="text-neutral-400 italic">None</span>}
                                    </p>
                                </div>
                            </div>
                            <div className="border-t border-neutral-100 dark:border-neutral-800 pt-2.5 flex justify-end">
                                <TableRowActions
                                    id={m.id}
                                    label={m.name}
                                    edit={{ onClick: () => openEditModal(m) }}
                                    deleteRoute="materials.destroy"
                                />
                            </div>
                        </div>
                    ))}
                    {materials.data.length === 0 && (
                        <div className="p-8 text-center bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-400 italic">
                            No materials found
                        </div>
                    )}
                </div>

                <Pagination links={materials.links} />
            </div>

            <SaveConfirmationModal
                isOpen={showSaveConfirm}
                onClose={() => setShowSaveConfirm(false)}
                onConfirm={confirmSave}
                title="Save Material Changes"
                description="Are you sure you want to save these changes to the material?"
                isProcessing={processing}
            />

            <Modal isOpen={showModal} onClose={() => { setShowModal(false); clearErrors(); }} title={editingMaterial ? 'Edit Material' : 'New Material'}>
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
                        <label htmlFor="unit_id" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Unit</label>
                        <select
                            id="unit_id"
                            value={data.unit_id}
                            onChange={e => setData('unit_id', e.target.value)}
                            className="w-full border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-sm bg-transparent dark:text-neutral-100 dark:bg-neutral-900"
                        >
                            <option value="">Select Unit</option>
                            {units.map(u => (
                                <option key={u.id} value={u.id}>{u.name} ({u.short_name})</option>
                            ))}
                        </select>
                        {errors.unit_id && <p className="text-xs text-red-500">{errors.unit_id}</p>}
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
                            onClick={() => { setShowModal(false); clearErrors(); }}
                            className="flex-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 py-2.5 rounded-xl text-sm font-semibold"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>

        </AppLayout>
    );
}
