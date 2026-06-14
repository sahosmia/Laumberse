import { Head, useForm } from '@inertiajs/react';
import { useState } from "react";
import { Search, Plus, Trash2, Edit3, X, Wallet, AlertCircle, Clock, Tag, CreditCard } from "lucide-react";
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, ManageAsset, AssetCategory } from '@/types';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';

interface ManageAssetsProps {
    manageAssets: ManageAsset[];
    categories: AssetCategory[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manage Assets',
        href: '/manage-assets',
    },
];

const formatCurrency = (n: number) => `৳${n.toLocaleString("en-BD")}`;

export default function ManageAssets({ manageAssets, categories }: ManageAssetsProps) {
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingAsset, setEditingAsset] = useState<ManageAsset | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const { data, setData, post, put, delete: destroy, reset, errors, processing } = useForm({
        name: '',
        description: '',
        purchase_date: new Date().toISOString().split('T')[0],
        cost: '' as string | number,
        status: 'Active',
        asset_category_id: '' as string | number,
        is_new_purchase: false,
        payment_method: 'Cash',
    });

    const filtered = manageAssets.filter((a) =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        (a.description?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (a.category?.name.toLowerCase() || "").includes(search.toLowerCase())
    );

    const openCreateModal = () => {
        setEditingAsset(null);
        reset();
        setShowModal(true);
    };

    const openEditModal = (manageAsset: ManageAsset) => {
        setEditingAsset(manageAsset);
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
            put(route('manage-assets.update', editingAsset.id), {
                onSuccess: () => setShowModal(false),
            });
        } else {
            post(route('manage-assets.store'), {
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
            destroy(route('manage-assets.destroy', deleteId), {
                onSuccess: () => setShowDeleteModal(false),
            });
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Active': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'Maintenance': return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
            case 'Disposed': return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-neutral-100 text-neutral-600';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Assets" />
            <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Manage Assets</h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Inventory of shop equipment & assets</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg"
                    >
                        <Plus className="w-4 h-4" /> Add Asset
                    </button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search assets..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full sm:w-80 pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((a) => (
                        <div key={a.id} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 group relative overflow-hidden transition-all hover:shadow-xl">
                            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openEditModal(a)} className="p-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-500 hover:text-blue-600"><Edit3 className="w-3.5 h-3.5" /></button>
                                <button onClick={() => handleDelete(a.id)} className="p-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-500 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                                    <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-neutral-900 dark:text-neutral-100">{a.name}</h4>
                                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-0.5">
                                        <Tag className="w-3 h-3" /> {a.category?.name || 'No Category'}
                                    </p>
                                </div>
                            </div>

                            {a.description && (
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4 line-clamp-2 italic">
                                    {a.description}
                                </p>
                            )}

                            <div className="grid grid-cols-2 gap-3 mb-4 border-t border-neutral-100 dark:border-neutral-800 pt-4">
                                <div className="space-y-0.5">
                                    <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">Purchase Date</p>
                                    <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                                        <Clock className="w-3 h-3" /> {a.purchase_date}
                                    </p>
                                </div>
                                <div className="space-y-0.5 text-right">
                                    <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">Status</p>
                                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusStyle(a.status)}`}>
                                        {a.status}
                                    </span>
                                </div>
                            </div>

                            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                                <p className="text-[10px] text-neutral-500 font-medium">Cost</p>
                                <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{formatCurrency(Number(a.cost))}</p>
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <div className="col-span-full py-20 text-center">
                            <AlertCircle className="w-12 h-12 text-neutral-200 dark:text-neutral-800 mx-auto mb-3" />
                            <p className="text-neutral-400">No assets found matching your search</p>
                        </div>
                    )}
                </div>
            </div>

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete Asset"
                description="Are you sure you want to delete this asset? This action cannot be undone."
                isProcessing={processing}
            />

            {/* Asset Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-lg w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{editingAsset ? 'Edit Asset' : 'New Asset'}</h3>
                            <button onClick={() => setShowModal(false)} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"><X className="w-5 h-5 text-neutral-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label htmlFor="name" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Asset Name</label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="w-full border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-sm bg-transparent dark:text-neutral-100"
                                        required
                                        placeholder="e.g. Washing Machine"
                                    />
                                    {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label htmlFor="asset_category_id" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Category</label>
                                    <select
                                        id="asset_category_id"
                                        value={data.asset_category_id}
                                        onChange={e => setData('asset_category_id', e.target.value)}
                                        className="w-full border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-sm bg-transparent dark:text-neutral-100"
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                    {errors.asset_category_id && <p className="text-xs text-red-500">{errors.asset_category_id}</p>}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label htmlFor="description" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Description</label>
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    className="w-full border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-sm bg-transparent dark:text-neutral-100 min-h-[80px]"
                                    placeholder="Brief details about the asset"
                                />
                                {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label htmlFor="purchase_date" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Purchase Date</label>
                                    <input
                                        id="purchase_date"
                                        type="date"
                                        value={data.purchase_date}
                                        onChange={e => setData('purchase_date', e.target.value)}
                                        className="w-full border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-sm bg-transparent dark:text-neutral-100"
                                        required
                                    />
                                    {errors.purchase_date && <p className="text-xs text-red-500">{errors.purchase_date}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label htmlFor="status" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Status</label>
                                    <select
                                        id="status"
                                        value={data.status}
                                        onChange={e => setData('status', e.target.value)}
                                        className="w-full border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-sm bg-transparent dark:text-neutral-100"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Maintenance">Maintenance</option>
                                        <option value="Disposed">Disposed</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-1">
                                    <label htmlFor="cost" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Cost</label>
                                    <input
                                        id="cost"
                                        type="number"
                                        value={data.cost}
                                        onChange={e => setData('cost', e.target.value)}
                                        className="w-full border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-sm bg-transparent dark:text-neutral-100"
                                        required
                                        placeholder="0.00"
                                    />
                                    {errors.cost && <p className="text-xs text-red-500">{errors.cost}</p>}
                                </div>
                            </div>

                            {!editingAsset && (
                                <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                                <CreditCard className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Create Expense Entry</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setData('is_new_purchase', !data.is_new_purchase)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${data.is_new_purchase ? 'bg-blue-600' : 'bg-neutral-200 dark:bg-neutral-700'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${data.is_new_purchase ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>

                                    {data.is_new_purchase && (
                                        <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <label htmlFor="payment_method" className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Payment Method</label>
                                            <select
                                                id="payment_method"
                                                value={data.payment_method}
                                                onChange={e => setData('payment_method', e.target.value)}
                                                className="w-full border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-sm bg-white dark:bg-neutral-900 dark:text-neutral-100"
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
                                    className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {editingAsset ? 'Update Asset' : 'Save Asset'}
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
