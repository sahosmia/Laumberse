import { SaveConfirmationModal } from '@/components/save-confirmation-modal';
import { TableRowActions } from '@/components/table-row-actions';
import { Modal } from '@/components/ui/modal';
import { Pagination } from '@/components/ui/pagination';
import { ASSET_STATUSES, ASSET_STATUS_STYLES, type AssetStatus } from '@/constants/status';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/format';
import { type BreadcrumbItem, ManageAsset } from '@/types';
import type { ManageAssetsProps } from '@/types/pages/manage-assets';
import { Head, useForm } from '@inertiajs/react';
import { AlertCircle, Clock, CreditCard, Plus, Search, Tag, Wallet } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manage Assets',
        href: '/manage-assets',
    },
];

export default function ManageAssets({ manageAssets, categories, filters }: ManageAssetsProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [showModal, setShowModal] = useState(false);
    const [editingAsset, setEditingAsset] = useState<ManageAsset | null>(null);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);

    const { data, setData, post, put, reset, errors, processing, clearErrors } = useForm({
        name: '',
        description: '',
        purchase_date: new Date().toISOString().split('T')[0],
        cost: '' as string | number,
        status: 'Active' as AssetStatus,
        asset_category_id: '' as string | number,
        is_new_purchase: false,
        payment_method: 'Cash',
    });

    useDebouncedSearch('manage-assets.index', search);

    const openCreateModal = () => {
        setEditingAsset(null);
        reset();
        clearErrors();
        setShowModal(true);
    };

    const openEditModal = (manageAsset: ManageAsset) => {
        setEditingAsset(manageAsset);
        clearErrors();
        setData({
            name: manageAsset.name,
            description: manageAsset.description || '',
            purchase_date: manageAsset.purchase_date,
            cost: manageAsset.cost,
            status: manageAsset.status,
            asset_category_id: manageAsset.asset_category_id,
            is_new_purchase: false, // Default to false on edit as expense is already handled
            payment_method: 'Cash',
        });
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingAsset) {
            setShowSaveConfirm(true);
        } else {
            post(route('manage-assets.store'), {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
            });
        }
    };

    const confirmSave = () => {
        if (editingAsset) {
            put(route('manage-assets.update', editingAsset.id), {
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Assets" />
            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Manage Assets</h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Inventory of shop equipment & assets</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg dark:bg-neutral-100 dark:text-neutral-900"
                    >
                        <Plus className="h-4 w-4" /> Add Asset
                    </button>
                </div>

                <div className="relative">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search assets..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-xl border border-neutral-200 bg-transparent py-2.5 pr-4 pl-10 text-sm transition-all focus:ring-2 focus:ring-blue-500/30 focus:outline-none sm:w-80 dark:border-neutral-800"
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {manageAssets.data.map((a) => (
                        <div
                            key={a.id}
                            className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 transition-all hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
                        >
                            <div className="absolute top-4 right-4">
                                <TableRowActions
                                    id={a.id}
                                    label={a.name}
                                    edit={{ onClick: () => openEditModal(a) }}
                                    deleteRoute="manage-assets.destroy"
                                />
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

                            {a.description && (
                                <p className="mb-4 line-clamp-2 text-sm text-neutral-500 italic dark:text-neutral-400">{a.description}</p>
                            )}

                            <div className="mb-4 grid grid-cols-2 gap-3 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase">Purchase Date</p>
                                    <p className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                        <Clock className="h-3 w-3" /> {a.purchase_date}
                                    </p>
                                </div>
                                <div className="space-y-0.5 text-right">
                                    <p className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase">Status</p>
                                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${getStatusStyle(a.status)}`}>
                                        {a.status}
                                    </span>
                                </div>
                            </div>

                            <div className="rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800/50">
                                <p className="text-[10px] font-medium text-neutral-500">Cost</p>
                                <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{formatCurrency(Number(a.cost))}</p>
                            </div>
                        </div>
                    ))}
                    {manageAssets.data.length === 0 && (
                        <div className="col-span-full py-20 text-center">
                            <AlertCircle className="mx-auto mb-3 h-12 w-12 text-neutral-200 dark:text-neutral-800" />
                            <p className="text-neutral-400">No assets found matching your search</p>
                        </div>
                    )}
                </div>

                <Pagination links={manageAssets.links} />
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
                        <div className="space-y-1">
                            <label htmlFor="name" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Asset Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full rounded-xl border border-neutral-200 bg-transparent px-3 py-2 text-sm dark:border-neutral-800 dark:text-neutral-100"
                                required
                                placeholder="e.g. Washing Machine"
                            />
                            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                        </div>
                        <div className="space-y-1">
                            <label htmlFor="asset_category_id" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Category
                            </label>
                            <select
                                id="asset_category_id"
                                value={data.asset_category_id}
                                onChange={(e) => setData('asset_category_id', e.target.value)}
                                className="w-full rounded-xl border border-neutral-200 bg-transparent px-3 py-2 text-sm dark:border-neutral-800 dark:text-neutral-100"
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
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
                        <div className="space-y-1">
                            <label htmlFor="purchase_date" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Purchase Date
                            </label>
                            <input
                                id="purchase_date"
                                type="date"
                                value={data.purchase_date}
                                onChange={(e) => setData('purchase_date', e.target.value)}
                                className="w-full rounded-xl border border-neutral-200 bg-transparent px-3 py-2 text-sm dark:border-neutral-800 dark:text-neutral-100"
                                required
                            />
                            {errors.purchase_date && <p className="text-xs text-red-500">{errors.purchase_date}</p>}
                        </div>
                        <div className="space-y-1">
                            <label htmlFor="status" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Status
                            </label>
                            <select
                                id="status"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value as AssetStatus)}
                                className="w-full rounded-xl border border-neutral-200 bg-transparent px-3 py-2 text-sm dark:border-neutral-800 dark:text-neutral-100"
                            >
                                {ASSET_STATUSES.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-1">
                            <label htmlFor="cost" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Cost
                            </label>
                            <input
                                id="cost"
                                type="number"
                                value={data.cost}
                                onChange={(e) => setData('cost', e.target.value)}
                                className="w-full rounded-xl border border-neutral-200 bg-transparent px-3 py-2 text-sm dark:border-neutral-800 dark:text-neutral-100"
                                required
                                placeholder="0.00"
                            />
                            {errors.cost && <p className="text-xs text-red-500">{errors.cost}</p>}
                        </div>
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
                                    <label htmlFor="payment_method" className="text-xs font-bold tracking-wider text-neutral-500 uppercase">
                                        Payment Method
                                    </label>
                                    <select
                                        id="payment_method"
                                        value={data.payment_method}
                                        onChange={(e) => setData('payment_method', e.target.value)}
                                        className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                        required
                                    >
                                        <option value="Cash">Cash</option>
                                        <option value="Bank Transfer">Bank Transfer</option>
                                        <option value="Mobile Banking">Mobile Banking</option>
                                        <option value="Card">Card</option>
                                    </select>
                                    {errors.payment_method && <p className="text-xs text-red-500">{errors.payment_method}</p>}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex gap-2 pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                        >
                            {editingAsset ? 'Update Asset' : 'Save Asset'}
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
