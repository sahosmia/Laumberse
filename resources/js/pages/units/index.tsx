import { SaveConfirmationModal } from '@/components/save-confirmation-modal';
import { TableRowActions } from '@/components/table-row-actions';
import { DataView, type DataViewColumn } from '@/components/ui/data-view';
import { FormButton } from '@/components/ui/form-button';
import { FormInput } from '@/components/ui/form-input';
import { Modal } from '@/components/ui/modal';
import { useDataViewSearch } from '@/hooks/use-data-view-search';
import { useTableLoading } from '@/hooks/use-table-loading';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Unit } from '@/types';
import type { UnitsProps } from '@/types/pages/units';
import { Head, useForm } from '@inertiajs/react';
import { Plus, Ruler } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Units',
        href: '/units',
    },
];

export default function Units({ units, filters }: UnitsProps) {
    const [showModal, setShowModal] = useState(false);
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);

    const { data, setData, post, put, reset, errors, processing, clearErrors } = useForm({
        name: '',
        short_name: '',
    });

    const { search, setSearch, perPage, setPerPage, reset: resetDataView } = useDataViewSearch('units.index', filters);
    const isLoading = useTableLoading();

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

    const columns: DataViewColumn<Unit>[] = [
        {
            key: 'actions',
            label: 'Actions',
            align: 'center',
            render: (u) => <TableRowActions id={u.id} label={u.name} edit={{ onClick: () => openEditModal(u) }} deleteRoute="units.destroy" />,
        },
        {
            key: 'name',
            label: 'Name',
            render: (u) => <span className="font-medium text-neutral-800 dark:text-neutral-200">{u.name}</span>,
        },
        {
            key: 'short_name',
            label: 'Short Name',
            className: 'font-mono text-neutral-600 dark:text-neutral-400',
            render: (u) => u.short_name,
        },
    ];

    const renderUnitCard = (u: Unit) => (
        <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-neutral-500">#{u.id}</span>
                <TableRowActions id={u.id} label={u.name} edit={{ onClick: () => openEditModal(u) }} deleteRoute="units.destroy" />
            </div>
            <div>
                <p className="font-bold text-neutral-900 dark:text-neutral-100">{u.name}</p>
                <p className="font-mono text-sm text-neutral-500 dark:text-neutral-400">{u.short_name}</p>
            </div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Units" />
            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                            <Ruler className="h-4 w-4" />
                        </div>
                        <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Product Units</h1>
                    </div>
                    <FormButton onClick={openCreateModal} icon={<Plus className="h-4 w-4" />}>
                        Add Unit
                    </FormButton>
                </div>

                <DataView
                    data={units.data}
                    getKey={(u) => u.id}
                    loading={isLoading}
                    emptyMessage="No units found"
                    search={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search units..."
                    onReset={resetDataView}
                    viewKey="units"
                    defaultView="table"
                    columns={columns}
                    renderCard={renderUnitCard}
                    pagination={units.links}
                    total={units.total}
                    perPage={perPage}
                    onPerPageChange={setPerPage}
                />
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
