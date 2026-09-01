import { SaveConfirmationModal } from '@/components/save-confirmation-modal';
import { TableRowActions } from '@/components/table-row-actions';
import { DataView, type DataViewColumn } from '@/components/ui/data-view';
import { FilterSelect } from '@/components/ui/filter-select';
import { FormButton } from '@/components/ui/form-button';
import { FormInput } from '@/components/ui/form-input';
import { FormLabel } from '@/components/ui/form-label';
import { FormSelect } from '@/components/ui/form-select';
import { Modal } from '@/components/ui/modal';
import { useDataViewSearch } from '@/hooks/use-data-view-search';
import { useTableLoading } from '@/hooks/use-table-loading';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/format';
import { type BreadcrumbItem, Material, SharedData } from '@/types';
import type { MaterialItem } from '@/types/pages/expenses';
import type { MaterialsProps } from '@/types/pages/materials';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Boxes, Plus, Ruler, ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { MaterialItemsForm } from '../expenses/com/MaterialItemsForm';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Materials',
        href: '/materials',
    },
];

export default function Materials({ materials, allMaterials, units, accounts, filters }: MaterialsProps) {
    const [showModal, setShowModal] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);

    const { settings } = usePage<SharedData>().props;
    const materialCategoryId = settings.material_expense_category_id;

    const { data, setData, post, put, reset, errors, processing, clearErrors } = useForm({
        name: '',
        unit_id: '' as string | number,
    });

    const {
        data: purchaseData,
        setData: setPurchaseData,
        post: postPurchase,
        reset: resetPurchase,
        errors: purchaseErrors,
        processing: purchaseProcessing,
        clearErrors: clearPurchaseErrors,
    } = useForm({
        expense_category_id: (materialCategoryId ?? '') as string | number,
        account_id: '' as string | number,
        amount: 0 as number | string,
        date: new Date().toISOString().slice(0, 10),
        description: '',
        items: [] as MaterialItem[],
    });

    useEffect(() => {
        const total = purchaseData.items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unit_price), 0);
        const rounded = Math.round((total + Number.EPSILON) * 100) / 100;
        if (Number(purchaseData.amount) !== rounded) {
            setPurchaseData('amount', rounded);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [purchaseData.items]);

    const openPurchaseModal = () => {
        resetPurchase();
        clearPurchaseErrors();
        setShowPurchaseModal(true);
    };

    const closePurchaseModal = () => {
        setShowPurchaseModal(false);
        clearPurchaseErrors();
    };

    const handlePurchaseSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postPurchase(route('expenses.store'), {
            onSuccess: () => {
                setShowPurchaseModal(false);
                resetPurchase();
            },
        });
    };

    const {
        search,
        setSearch,
        perPage,
        setPerPage,
        filterValues,
        setFilter,
        reset: resetDataView,
    } = useDataViewSearch('materials.index', filters, {}, 'created_at:desc', 300, { unit_id: filters.unit_id || '' });
    const isLoading = useTableLoading();

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

    const columns: DataViewColumn<Material>[] = [
        {
            key: 'actions',
            label: 'Actions',
            align: 'center',
            render: (m) => (
                <TableRowActions id={m.id} label={m.name} edit={{ onClick: () => openEditModal(m) }} deleteRoute="materials.destroy" />
            ),
        },
        {
            key: 'name',
            label: 'Name',
            render: (m) => <span className="font-medium text-neutral-900 dark:text-neutral-100">{m.name}</span>,
        },
        {
            key: 'unit',
            label: 'Unit',
            render: (m) =>
                m.unit ? (
                    <span className="text-neutral-600 dark:text-neutral-400">
                        {m.unit.name} ({m.unit.short_name})
                    </span>
                ) : (
                    <span className="text-neutral-400 italic">None</span>
                ),
        },
    ];

    const renderMaterialCard = (m: Material) => (
        <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-neutral-500">#{m.id}</span>
                <TableRowActions id={m.id} label={m.name} edit={{ onClick: () => openEditModal(m) }} deleteRoute="materials.destroy" />
            </div>
            <div>
                <p className="font-bold text-neutral-900 dark:text-neutral-100">{m.name}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {m.unit ? `${m.unit.name} (${m.unit.short_name})` : <span className="italic">No unit</span>}
                </p>
            </div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Materials" />
            <div className="space-y-4 p-4">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                            <Boxes className="h-4 w-4" />
                        </div>
                        <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Materials</h1>
                    </div>
                    <div className="flex gap-2">
                        <FormButton
                            onClick={openPurchaseModal}
                            icon={<ShoppingCart className="h-4 w-4" />}
                            variant="secondary"
                            disabled={!materialCategoryId}
                            title={!materialCategoryId ? 'Set the Material Expense Category in Global Settings first.' : undefined}
                        >
                            Record Purchase
                        </FormButton>
                        <FormButton onClick={openCreateModal} icon={<Plus className="h-4 w-4" />}>
                            Add Material
                        </FormButton>
                    </div>
                </div>

                <DataView
                    data={materials.data}
                    getKey={(m) => m.id}
                    loading={isLoading}
                    emptyMessage="No materials found"
                    search={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search materials..."
                    filters={
                        <FilterSelect
                            icon={<Ruler className="h-4 w-4" />}
                            containerClassName="w-full sm:w-56"
                            value={filterValues.unit_id ?? ''}
                            onChange={(e) => setFilter('unit_id', e.target.value)}
                        >
                            <option value="">All Units</option>
                            {units.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.name} ({u.short_name})
                                </option>
                            ))}
                        </FilterSelect>
                    }
                    onReset={resetDataView}
                    viewKey="materials"
                    defaultView="table"
                    columns={columns}
                    renderCard={renderMaterialCard}
                    pagination={materials.links}
                    total={materials.total}
                    perPage={perPage}
                    onPerPageChange={setPerPage}
                />
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
                    <FormInput
                        id="name"
                        label="Material Name"
                        required
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className="rounded-xl border-neutral-200 bg-transparent dark:border-neutral-800 dark:text-neutral-100"
                        placeholder="e.g. Fabric A"
                        error={errors.name}
                    />
                    <FormSelect
                        id="unit_id"
                        label="Unit"
                        value={data.unit_id}
                        onChange={(e) => setData('unit_id', e.target.value)}
                        error={errors.unit_id}
                    >
                        <option value="">Select Unit</option>
                        {units.map((u) => (
                            <option key={u.id} value={u.id}>
                                {u.name} ({u.short_name})
                            </option>
                        ))}
                    </FormSelect>

                    <div className="flex gap-2 pt-2">
                        <FormButton type="submit" loading={processing} className="flex-1 rounded-xl">
                            {processing ? 'Saving...' : editingMaterial ? 'Update Material' : 'Save Material'}
                        </FormButton>
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

            <Modal isOpen={showPurchaseModal} onClose={closePurchaseModal} title="Record Material Purchase" size="lg">
                <form onSubmit={handlePurchaseSubmit} className="space-y-4">
                    <FormSelect
                        id="purchase_account_id"
                        label="Payment Account"
                        required
                        value={purchaseData.account_id}
                        onChange={(e) => setPurchaseData('account_id', e.target.value)}
                        error={purchaseErrors.account_id}
                    >
                        <option value="">Select Account</option>
                        {accounts.map((a) => (
                            <option key={a.id} value={a.id}>
                                {a.name} {a.account_number ? `(${a.account_number})` : ''}
                            </option>
                        ))}
                    </FormSelect>

                    <FormInput
                        id="purchase_date"
                        label="Date"
                        type="date"
                        required
                        value={purchaseData.date}
                        onChange={(e) => setPurchaseData('date', e.target.value)}
                        className="rounded-xl border-neutral-200 bg-transparent dark:border-neutral-800 dark:text-neutral-100"
                        error={purchaseErrors.date}
                    />

                    <MaterialItemsForm
                        items={purchaseData.items}
                        materials={allMaterials}
                        errors={purchaseErrors}
                        onChange={(items) => setPurchaseData('items', items)}
                    />

                    <div className="space-y-1.5">
                        <FormLabel htmlFor="purchase_description">Description</FormLabel>
                        <textarea
                            id="purchase_description"
                            value={purchaseData.description}
                            onChange={(e) => setPurchaseData('description', e.target.value)}
                            className="w-full rounded-xl border border-neutral-200 bg-transparent px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                            rows={2}
                        />
                        {purchaseErrors.description && <p className="text-xs text-red-500">{purchaseErrors.description}</p>}
                    </div>

                    <div className="rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800/50">
                        <p className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase">Total Amount</p>
                        <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{formatCurrency(purchaseData.amount)}</p>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <FormButton type="submit" loading={purchaseProcessing} className="flex-1 rounded-xl">
                            {purchaseProcessing ? 'Saving...' : 'Save Purchase'}
                        </FormButton>
                        <button
                            type="button"
                            onClick={closePurchaseModal}
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
