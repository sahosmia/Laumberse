import { SaveConfirmationModal } from '@/components/save-confirmation-modal';
import { TableRowActions } from '@/components/table-row-actions';
import { Modal } from '@/components/ui/modal';
import { Pagination } from '@/components/ui/pagination';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Material } from '@/types';
import type { MaterialsProps } from '@/types/pages/materials';
import { Head, useForm } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Materials',
        href: '/materials',
    },
];

export default function Materials({ materials, units, filters }: MaterialsProps) {
    const [search, setSearch] = useState(filters.search || '');
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
            <div className="space-y-4 p-4">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Materials</h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Manage raw material master data</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="animate-fade-in flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg dark:bg-neutral-100 dark:text-neutral-900"
                    >
                        <Plus className="h-4 w-4" /> Add Material
                    </button>
                </div>

                <div className="relative">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search materials..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-xl border border-neutral-200 bg-transparent py-2.5 pr-4 pl-10 text-sm transition-all focus:ring-2 focus:ring-blue-500/30 focus:outline-none sm:w-80 dark:border-neutral-800"
                    />
                </div>

                {/* Desktop view */}
                <div className="hidden overflow-hidden rounded-2xl border border-neutral-200 bg-white md:block dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-neutral-200 bg-neutral-50 text-xs tracking-wider text-neutral-500 uppercase dark:border-neutral-800 dark:bg-neutral-800/50">
                                    <th className="px-5 py-3 text-left font-semibold">Name</th>
                                    <th className="px-5 py-3 text-left font-semibold">Unit</th>
                                    <th className="px-5 py-3 text-center font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {materials.data.map((m) => (
                                    <tr key={m.id} className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
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
                                        <td colSpan={3} className="px-5 py-10 text-center text-neutral-400 italic">
                                            No materials found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile view */}
                <div className="block space-y-4 md:hidden">
                    {materials.data.map((m) => (
                        <div
                            key={m.id}
                            className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{m.name}</h4>
                                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                        Unit:{' '}
                                        {m.unit ? `${m.unit.name} (${m.unit.short_name})` : <span className="text-neutral-400 italic">None</span>}
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-end border-t border-neutral-100 pt-2.5 dark:border-neutral-800">
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
                        <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center text-neutral-400 italic dark:border-neutral-800 dark:bg-neutral-900">
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

            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    clearErrors();
                }}
                title={editingMaterial ? 'Edit Material' : 'New Material'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label htmlFor="name" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            Material Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full rounded-xl border border-neutral-200 bg-transparent px-3 py-2 text-sm dark:border-neutral-800 dark:text-neutral-100"
                            required
                            placeholder="e.g. Fabric A"
                        />
                        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="unit_id" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            Unit
                        </label>
                        <select
                            id="unit_id"
                            value={data.unit_id}
                            onChange={(e) => setData('unit_id', e.target.value)}
                            className="w-full rounded-xl border border-neutral-200 bg-transparent px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                        >
                            <option value="">Select Unit</option>
                            {units.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.name} ({u.short_name})
                                </option>
                            ))}
                        </select>
                        {errors.unit_id && <p className="text-xs text-red-500">{errors.unit_id}</p>}
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                        >
                            {editingMaterial ? 'Update Material' : 'Save Material'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setShowModal(false);
                                clearErrors();
                            }}
                            className="flex-1 rounded-xl bg-neutral-100 py-2.5 text-sm font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
