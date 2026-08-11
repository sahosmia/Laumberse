import { Head, useForm } from '@inertiajs/react';
import { useState } from "react";
import { Search, Plus } from "lucide-react";
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Unit } from '@/types';
import { SaveConfirmationModal } from '@/components/save-confirmation-modal';
import { Modal } from '@/components/ui/modal';
import { FormInput } from '@/components/ui/form-input';
import { FormButton } from '@/components/ui/form-button';
import { Pagination } from '@/components/ui/pagination';
import { TableRowActions } from '@/components/table-row-actions';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import type { UnitsProps } from '@/types/pages/units';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Units',
        href: '/units',
    },
];

export default function Units({ units, filters }: UnitsProps) {
    const [search, setSearch] = useState(filters.search || "");
    const [showModal, setShowModal] = useState(false);
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);

    const { data, setData, post, put, reset, errors, processing } = useForm({
        name: '',
        short_name: '',
    });

    useDebouncedSearch('units.index', search);

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
                onError: () => {
                    setShowSaveConfirm(false);
                },
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
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">{units.total} units defined</p>
                    </div>
                    <FormButton
                        onClick={openCreateModal}
                        icon={<Plus className="w-4 h-4" />}
                    >
                        Add Unit
                    </FormButton>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search units..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full sm:w-80 pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all min-h-12 md:min-h-10 text-neutral-900 dark:text-neutral-100"
                    />
                </div>

                <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[500px]">
                            <thead>
                                <tr className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 text-xs uppercase tracking-wider">
                                    <th className="text-left px-5 py-3 font-semibold">Name</th>
                                    <th className="text-left px-3 py-3 font-semibold">Short Name</th>
                                    <th className="text-center px-3 py-3 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {units.data.map((u) => (
                                    <tr key={u.id} className="border-b border-neutral-50 dark:border-neutral-800 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                                        <td className="px-5 py-3 font-medium text-neutral-800 dark:text-neutral-200">{u.name}</td>
                                        <td className="px-3 py-3 text-neutral-600 dark:text-neutral-400 font-mono">{u.short_name}</td>
                                        <td className="px-3 py-3">
                                            <div className="flex items-center justify-center">
                                                <TableRowActions
                                                    id={u.id}
                                                    label={u.name}
                                                    edit={{ onClick: () => openEditModal(u) }}
                                                    deleteRoute="units.destroy"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <Pagination links={units.links} />
            </div>

            <SaveConfirmationModal
                isOpen={showSaveConfirm}
                onClose={() => setShowSaveConfirm(false)}
                onConfirm={confirmSave}
                title="Save Unit Changes"
                description="Are you sure you want to save these changes to the unit?"
                isProcessing={processing}
            />

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingUnit ? 'Edit Unit' : 'New Unit'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormInput
                        label="Unit Name"
                        value={data.name}
                        onChange={e => setData('name', e.target.value)}
                        placeholder="e.g. Kilogram"
                        required
                        error={errors.name}
                    />
                    <FormInput
                        label="Short Name"
                        value={data.short_name}
                        onChange={e => setData('short_name', e.target.value)}
                        placeholder="e.g. kg"
                        required
                        error={errors.short_name}
                    />
                    <div className="flex gap-2 pt-2">
                        <FormButton
                            type="submit"
                            loading={processing}
                            className="flex-1"
                        >
                            {editingUnit ? 'Update Unit' : 'Save Unit'}
                        </FormButton>
                        <FormButton
                            type="button"
                            onClick={() => setShowModal(false)}
                            variant="secondary"
                            className="flex-1"
                        >
                            Cancel
                        </FormButton>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
