import { SaveConfirmationModal } from '@/components/save-confirmation-modal';
import { TableRowActions } from '@/components/table-row-actions';
import { FormButton } from '@/components/ui/form-button';
import { FormInput } from '@/components/ui/form-input';
import { Modal } from '@/components/ui/modal';
import { Pagination } from '@/components/ui/pagination';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Unit } from '@/types';
import type { UnitsProps } from '@/types/pages/units';
import { Head, useForm } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Units',
        href: '/units',
    },
];

export default function Units({ units, filters }: UnitsProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [showModal, setShowModal] = useState(false);
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);

    const { data, setData, post, put, reset, errors, processing, clearErrors } = useForm({
        name: '',
        short_name: '',
    });

    useDebouncedSearch('units.index', search);

    const openCreateModal = () => {
        setEditingUnit(null);
        reset();
        clearErrors();
        setShowModal(true);
    };

    const openEditModal = (unit: Unit) => {
        setEditingUnit(unit);
        clearErrors();
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
            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Product Units</h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">{units.total} units defined</p>
                    </div>
                    <FormButton onClick={openCreateModal} icon={<Plus className="h-4 w-4" />}>
                        Add Unit
                    </FormButton>
                </div>

                <div className="relative">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search units..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="min-h-12 w-full rounded-xl border border-neutral-200 bg-transparent py-2.5 pr-4 pl-10 text-sm text-neutral-900 transition-all focus:ring-2 focus:ring-blue-500/30 focus:outline-none sm:w-80 md:min-h-10 dark:border-neutral-800 dark:text-neutral-100"
                    />
                </div>

                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[500px] text-sm">
                            <thead>
                                <tr className="bg-neutral-50 text-xs tracking-wider text-neutral-500 uppercase dark:bg-neutral-800/50">
                                    <th className="px-5 py-3 text-left font-semibold">Name</th>
                                    <th className="px-3 py-3 text-left font-semibold">Short Name</th>
                                    <th className="px-3 py-3 text-center font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {units.data.map((u) => (
                                    <tr
                                        key={u.id}
                                        className="border-b border-neutral-50 transition-colors hover:bg-neutral-50/50 dark:border-neutral-800 dark:hover:bg-neutral-800/30"
                                    >
                                        <td className="px-5 py-3 font-medium text-neutral-800 dark:text-neutral-200">{u.name}</td>
                                        <td className="px-3 py-3 font-mono text-neutral-600 dark:text-neutral-400">{u.short_name}</td>
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

            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    clearErrors();
                }}
                title={editingUnit ? 'Edit Unit' : 'New Unit'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormInput
                        label="Unit Name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="e.g. Kilogram"
                        required
                        error={errors.name}
                    />
                    <FormInput
                        label="Short Name"
                        value={data.short_name}
                        onChange={(e) => setData('short_name', e.target.value)}
                        placeholder="e.g. kg"
                        required
                        error={errors.short_name}
                    />
                    <div className="flex gap-2 pt-2">
                        <FormButton type="submit" loading={processing} className="flex-1">
                            {editingUnit ? 'Update Unit' : 'Save Unit'}
                        </FormButton>
                        <FormButton
                            type="button"
                            onClick={() => {
                                setShowModal(false);
                                clearErrors();
                            }}
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
