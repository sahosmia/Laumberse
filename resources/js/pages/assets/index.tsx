import { SaveConfirmationModal } from '@/components/save-confirmation-modal';
import { TableRowActions } from '@/components/table-row-actions';
import { DataView, type DataViewColumn } from '@/components/ui/data-view';
import { DateFilterBar } from '@/components/ui/date-filter-bar';
import { FilterSelect } from '@/components/ui/filter-select';
import { FormButton } from '@/components/ui/form-button';
import { FormInput } from '@/components/ui/form-input';
import { FormLabel } from '@/components/ui/form-label';
import { FormSelect } from '@/components/ui/form-select';
import { Modal } from '@/components/ui/modal';
import { RequiredMark } from '@/components/ui/required-mark';
import { ASSET_STATUSES, ASSET_STATUS_STYLES, type AssetStatus } from '@/constants/status';
import { useDataViewSearch } from '@/hooks/use-data-view-search';
import { useTableLoading } from '@/hooks/use-table-loading';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatDate } from '@/lib/format';
import { type Asset, type BreadcrumbItem, SharedData } from '@/types';
import type { AssetsProps } from '@/types/pages/assets';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Clock, CreditCard, Plus, Tag, Wallet } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Assets',
        href: '/assets',
    },
];

export default function Assets({ assets, categories, accounts, filters }: AssetsProps) {
    const { outlet } = usePage<SharedData>().props;
    const [showModal, setShowModal] = useState(false);
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);

    const [dateFilter, setDateFilter] = useState(filters.date_filter || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [specificDate, setSpecificDate] = useState(filters.specific_date || '');
    const isCustomRange = dateFilter === 'custom';
    const isSpecificDate = dateFilter === 'specific_date';

    const { data, setData, post, put, reset, errors, processing, clearErrors } = useForm({
        name: '',
        description: '',
        purchase_date: new Date().toISOString().split('T')[0],
        cost: '' as string | number,
        status: 'Active' as AssetStatus,
        asset_category_id: '' as string | number,
        is_new_purchase: false,
        account_id: '' as string | number,
        outlet_id: '' as number | '',
    });

    const {
        search,
        setSearch,
        perPage,
        setPerPage,
        filterValues,
        setFilter,
        reset: resetDataView,
    } = useDataViewSearch(
        'assets.index',
        filters,
        {
            date_filter: dateFilter,
            ...(isCustomRange ? { start_date: startDate, end_date: endDate } : {}),
            ...(isSpecificDate ? { specific_date: specificDate } : {}),
        },
        'created_at:desc',
        300,
        { status: filters.status || '' },
    );
    const isLoading = useTableLoading();

    const handleReset = () => {
        resetDataView();
        setDateFilter('');
        setStartDate('');
        setEndDate('');
        setSpecificDate('');
    };

    const openCreateModal = () => {
        setEditingAsset(null);
        reset();
        clearErrors();
        setShowModal(true);
    };

    const openEditModal = (asset: Asset) => {
        setEditingAsset(asset);
        clearErrors();
        setData({
            name: asset.name,
            description: asset.description || '',
            purchase_date: asset.purchase_date,
            cost: asset.cost,
            status: asset.status,
            asset_category_id: asset.asset_category_id,
            is_new_purchase: false, // Default to false on edit as expense is already handled
            account_id: '',
        });
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingAsset) {
            setShowSaveConfirm(true);
        } else {
            post(route('assets.store'), {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
            });
        }
    };

    const confirmSave = () => {
        if (editingAsset) {
            put(route('assets.update', editingAsset.id), {
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

    const getStatusStyle = (status: AssetStatus) => ASSET_STATUS_STYLES[status] ?? 'bg-neutral-100 text-neutral-600';

    const columns: DataViewColumn<Asset>[] = [
        {
            key: 'actions',
            label: 'Actions',
            align: 'center',
            render: (a) => <TableRowActions id={a.id} label={a.name} edit={{ onClick: () => openEditModal(a) }} deleteRoute="assets.destroy" />,
        },
        {
            key: 'name',
            label: 'Name',
            render: (a) => (
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20">
                        <Wallet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <p className="font-medium text-neutral-900 dark:text-neutral-100">{a.name}</p>
                        <p className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                            <Tag className="h-3 w-3" /> {a.category?.name || 'No Category'}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            key: 'purchase_date',
            label: 'Purchase Date',
            className: 'text-neutral-600 dark:text-neutral-400',
            render: (a) => formatDate(a.purchase_date),
        },
        {
            key: 'status',
            label: 'Status',
            render: (a) => (
                <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${getStatusStyle(a.status)}`}>{a.status}</span>
            ),
        },
        {
            key: 'cost',
            label: 'Cost',
            align: 'right',
            className: 'font-bold text-neutral-900 dark:text-neutral-100',
            render: (a) => formatCurrency(Number(a.cost)),
        },
    ];

    const renderAssetCard = (a: Asset) => (
        <div className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 transition-all hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
            <div className="absolute top-4 right-4">
                <TableRowActions id={a.id} label={a.name} edit={{ onClick: () => openEditModal(a) }} deleteRoute="assets.destroy" />
            </div>
            <div className="mb-4 flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/20">
                    <Wallet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h4 className="font-bold text-neutral-900 dark:text-neutral-100">{a.name}</h4>
                    <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                        <Tag className="h-3 w-3" /> {a.category?.name || 'No Category'}
                    </p>
                </div>
            </div>

            {a.description && <p className="mb-4 line-clamp-2 text-sm text-neutral-500 italic dark:text-neutral-400">{a.description}</p>}

            <div className="mb-4 grid grid-cols-2 gap-3 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                <div className="space-y-0.5">
                    <p className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase">Purchase Date</p>
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        <Clock className="h-3 w-3" /> {formatDate(a.purchase_date)}
                    </p>
                </div>
                <div className="space-y-0.5 text-right">
                    <p className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase">Status</p>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${getStatusStyle(a.status)}`}>{a.status}</span>
                </div>
            </div>

            <div className="rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800/50">
                <p className="text-[10px] font-medium text-neutral-500">Cost</p>
                <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{formatCurrency(Number(a.cost))}</p>
            </div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Assets" />
            <div className="space-y-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                            <Wallet className="h-4 w-4" />
                        </div>
                        <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Assets</h1>
                    </div>
                    <FormButton onClick={openCreateModal} icon={<Plus className="h-4 w-4" />}>
                        Add Asset
                    </FormButton>
                </div>

                <DataView
                    data={assets.data}
                    getKey={(a) => a.id}
                    loading={isLoading}
                    emptyMessage="No assets found matching your search"
                    search={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search assets..."
                    filters={
                        <>
                            <FilterSelect
                                icon={<Tag className="h-4 w-4" />}
                                containerClassName="w-full sm:w-44"
                                value={filterValues.status ?? ''}
                                onChange={(e) => setFilter('status', e.target.value)}
                            >
                                <option value="">All Statuses</option>
                                {ASSET_STATUSES.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </FilterSelect>
                            <DateFilterBar
                                dateFilter={dateFilter}
                                onDateFilterChange={setDateFilter}
                                isCustomRange={isCustomRange}
                                startDate={startDate}
                                onStartDateChange={setStartDate}
                                endDate={endDate}
                                onEndDateChange={setEndDate}
                                isSpecificDate={isSpecificDate}
                                specificDate={specificDate}
                                onSpecificDateChange={setSpecificDate}
                            />
                        </>
                    }
                    onReset={handleReset}
                    viewKey="assets"
                    defaultView="table"
                    columns={columns}
                    renderCard={renderAssetCard}
                    pagination={assets.links}
                    total={assets.total}
                    perPage={perPage}
                    onPerPageChange={setPerPage}
                />
            </div>

            <SaveConfirmationModal
                isOpen={showSaveConfirm}
                onClose={() => setShowSaveConfirm(false)}
                onConfirm={confirmSave}
                title="Save Asset Changes"
                description="Are you sure you want to save these changes to the asset?"
                isProcessing={processing}
            />

            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    clearErrors();
                }}
                title={editingAsset ? 'Edit Asset' : 'New Asset'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormInput
                            id="name"
                            label="Asset Name"
                            required
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="rounded-xl border-neutral-200 bg-transparent dark:border-neutral-800 dark:text-neutral-100"
                            placeholder="e.g. Washing Machine"
                            error={errors.name}
                        />
                        <div className="space-y-1">
                            <FormLabel htmlFor="asset_category_id" required>
                                Category
                            </FormLabel>
                            <FormSelect
                                id="asset_category_id"
                                value={data.asset_category_id}
                                onChange={(e) => setData('asset_category_id', e.target.value)}
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </FormSelect>
                            {errors.asset_category_id && <p className="text-xs text-red-500">{errors.asset_category_id}</p>}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="description" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            Description
                        </label>
                        <textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="min-h-[80px] w-full rounded-xl border border-neutral-200 bg-transparent px-3 py-2 text-sm dark:border-neutral-800 dark:text-neutral-100"
                            placeholder="Brief details about the asset"
                        />
                        {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormInput
                            id="purchase_date"
                            label="Purchase Date"
                            required
                            type="date"
                            value={data.purchase_date}
                            onChange={(e) => setData('purchase_date', e.target.value)}
                            className="rounded-xl border-neutral-200 bg-transparent dark:border-neutral-800 dark:text-neutral-100"
                            error={errors.purchase_date}
                        />
                        <div className="space-y-1">
                            <label htmlFor="status" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Status
                            </label>
                            <FormSelect id="status" value={data.status} onChange={(e) => setData('status', e.target.value as AssetStatus)}>
                                {ASSET_STATUSES.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </FormSelect>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <FormInput
                            id="cost"
                            label="Cost"
                            required
                            type="number"
                            value={data.cost}
                            onChange={(e) => setData('cost', e.target.value)}
                            className="rounded-xl border-neutral-200 bg-transparent dark:border-neutral-800 dark:text-neutral-100"
                            placeholder="0.00"
                            error={errors.cost}
                        />
                    </div>

                    {!editingAsset && (
                        <div className="space-y-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-800/50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="rounded-lg bg-blue-100 p-1.5 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                        <CreditCard className="h-4 w-4" />
                                    </div>
                                    <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Create Expense Entry</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setData('is_new_purchase', !data.is_new_purchase)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${data.is_new_purchase ? 'bg-blue-600' : 'bg-neutral-200 dark:bg-neutral-700'}`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${data.is_new_purchase ? 'translate-x-6' : 'translate-x-1'}`}
                                    />
                                </button>
                            </div>

                            {data.is_new_purchase && (
                                <div className="animate-in fade-in slide-in-from-top-2 space-y-1 duration-300">
                                    <label htmlFor="account_id" className="text-xs font-bold tracking-wider text-neutral-500 uppercase">
                                        Payment Account <RequiredMark />
                                    </label>
                                    <FormSelect
                                        id="account_id"
                                        value={data.account_id}
                                        onChange={(e) => setData('account_id', e.target.value)}
                                        required
                                    >
                                        <option value="">Select Account</option>
                                        {accounts.map((a) => (
                                            <option key={a.id} value={a.id}>
                                                {a.name} {a.account_number ? `(${a.account_number})` : ''}
                                            </option>
                                        ))}
                                    </FormSelect>
                                    {errors.account_id && <p className="text-xs text-red-500">{errors.account_id}</p>}
                                </div>
                            )}
                        </div>
                    )}

                    {!editingAsset && outlet?.isAll && (
                        <div className="space-y-1">
                            <FormLabel required>Outlet</FormLabel>
                            <FormSelect
                                value={data.outlet_id}
                                onChange={(e) => setData('outlet_id', e.target.value ? Number(e.target.value) : '')}
                                required
                            >
                                <option value="">Select an outlet</option>
                                {outlet.available.map((o) => (
                                    <option key={o.id} value={o.id}>
                                        {o.name}
                                    </option>
                                ))}
                            </FormSelect>
                            {errors.outlet_id && <p className="text-xs text-red-500">{errors.outlet_id}</p>}
                        </div>
                    )}

                    <div className="flex gap-2 pt-2">
                        <FormButton type="submit" loading={processing} className="flex-1 rounded-xl">
                            {processing ? 'Saving...' : editingAsset ? 'Update Asset' : 'Save Asset'}
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
        </AppLayout>
    );
}
