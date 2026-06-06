import { Head, useForm, router } from '@inertiajs/react';
import { useState } from "react";
import { Search, Plus, Trash2, Edit3, X } from "lucide-react";
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Category, Unit, Outlet, Product } from '@/types';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';

interface ProductsProps {
    products: Product[];
    categories: Category[];
    units: Unit[];
    outlets: Outlet[];
    filter?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Products',
        href: '/products',
    },
];

const formatCurrency = (n: number) => `৳${n.toLocaleString("en-BD")}`;

export default function Products({ products, categories, filter, units, outlets }: ProductsProps) {
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

    const { data, setData, post, put, delete: destroy, reset, errors, processing } = useForm({
        name: '',
        category_id: null as number | null,
        unit_id: null as number | null,
                image: null as File | null,

        price: '',
        outlet_prices: [] as { outlet_id: number; price: string }[],
    });

    const filtered = products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toString().includes(search)
    );

    const openCreateModal = () => {
        setEditingProduct(null);
        reset();
        setData('outlet_prices', outlets.map(o => ({ outlet_id: o.id, price: '' })));
        setShowModal(true);
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setData({
            name: product.name,
            category_id: product.category_id,
            unit_id: product.unit_id || null,
            image: null,
            price: product.price.toString(),
            outlet_prices: outlets.map(o => {
                const existing = product.outlet_prices?.find(op => op.outlet_id === o.id);
                return { outlet_id: o.id, price: existing ? existing.price.toString() : '' };
            }),
        });
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingProduct) {
            put(route('products.update', editingProduct.id), {
                onSuccess: () => setShowModal(false),
            });
        } else {
            post(route('products.store'), {
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
            destroy(route('products.destroy', deleteId), {
                onSuccess: () => setShowDeleteModal(false),
            });
        }
    };

    const handleBulkDelete = () => {
        setShowBulkDeleteModal(true);
    };

    const confirmBulkDelete = () => {
        router.delete(route('products.bulk-destroy'), {
            data: { ids: selectedIds },
            onSuccess: () => {
                setSelectedIds([]);
                setShowBulkDeleteModal(false);
            },
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filtered.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filtered.map(p => p.id));
        }
    };

    const toggleSelect = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products - Laurnverse" />
            <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Products</h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">{products.length} items</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleBulkDelete}
                            className="flex items-center gap-2 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 px-4 py-2.5 rounded-xl text-sm font-semibold border border-red-100 dark:border-red-800/50 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            {selectedIds.length > 0 ? `Delete Selected (${selectedIds.length})` : 'Delete All'}
                        </button>
                        <button
                            onClick={openCreateModal}
                            className="flex items-center gap-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg"
                        >
                            <Plus className="w-4 h-4" /> Add Product
                        </button>
                    </div>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search products..."
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
                                    <th className="px-5 py-3 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.length === filtered.length && filtered.length > 0}
                                            onChange={toggleSelectAll}
                                            className="rounded border-neutral-300 dark:border-neutral-700 text-blue-600 focus:ring-blue-500"
                                        />
                                    </th>
                                    <th className="text-left px-3 py-3 font-semibold">ID</th>
                                    <th className="text-left px-3 py-3 font-semibold">Name</th>
                                    <th className="text-left px-3 py-3 font-semibold">Category</th>
                                    <th className="text-right px-3 py-3 font-semibold">Price</th>
                                    <th className="text-center px-3 py-3 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((p) => (
                                    <tr key={p.id} className={`border-b border-neutral-50 dark:border-neutral-800 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors ${selectedIds.includes(p.id) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                                        <td className="px-5 py-3 text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(p.id)}
                                                onChange={() => toggleSelect(p.id)}
                                                className="rounded border-neutral-300 dark:border-neutral-700 text-blue-600 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="px-3 py-3 font-mono text-xs text-neutral-500">{p.id}</td>
                                         <td className="px-3 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex-shrink-0 overflow-hidden border border-neutral-200 dark:border-neutral-800">
                                                    {p.image_url ? (
                                                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-neutral-400 font-bold text-xs uppercase">
                                                            {p.name.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="font-medium text-neutral-800 dark:text-neutral-200">{p.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3">
                                            <span className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-[10px] font-semibold text-neutral-600 dark:text-neutral-400">
                                                {p.category?.name}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 text-right font-bold text-neutral-900 dark:text-neutral-100">{formatCurrency(Number(p.price))}</td>
                                        <td className="px-3 py-3">
                                            <div className="flex items-center justify-center gap-1">
                                                <button onClick={() => openEditModal(p)} className="p-1.5 text-neutral-400 hover:text-blue-600"><Edit3 className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete(p.id)} className="p-1.5 text-neutral-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
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
                title="Delete Product"
                description="Are you sure you want to delete this product? This action cannot be undone."
                isProcessing={processing}
            />

            <DeleteConfirmationModal
                isOpen={showBulkDeleteModal}
                onClose={() => setShowBulkDeleteModal(false)}
                onConfirm={confirmBulkDelete}
                title={selectedIds.length > 0 ? "Delete Selected Products" : "Delete All Products"}
                description={selectedIds.length > 0
                    ? `Are you sure you want to delete ${selectedIds.length} selected products?`
                    : "Are you sure you want to delete ALL products? This will remove every product from the system."}
                isProcessing={processing}
            />

            {/* Product Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{editingProduct ? 'Edit Product' : 'New Product'}</h3>
                            <button onClick={() => setShowModal(false)} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Product Image</label>
                                <div className="mt-1 flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex-shrink-0 overflow-hidden border border-neutral-200 dark:border-neutral-800">
                                        {data.image ? (
                                            <img src={URL.createObjectURL(data.image)} className="w-full h-full object-cover" />
                                        ) : (editingProduct?.image_url ? (
                                            <img src={editingProduct.image_url} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                                <Plus className="w-6 h-6" />
                                            </div>
                                        ))}
                                    </div>
                                    <input
                                        type="file"
                                        onChange={e => setData('image', e.target.files?.[0] || null)}
                                        className="text-xs text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-neutral-800 dark:file:text-neutral-300"
                                        accept="image/*"
                                    />
                                </div>
                                {errors.image && <p className="text-xs text-red-500 mt-1">{errors.image}</p>}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Product Name</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="w-full mt-1 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-sm bg-transparent dark:text-neutral-100"
                                    placeholder="Enter product name (e.g. Cotton Shirt)"
                                    required
                                />
                                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Category</label>
                                    <SearchableSelect
                                        options={categories.map(c => ({ label: c.name, value: c.id }))}
                                        value={data.category_id || ''}
                                        onChange={val => setData('category_id', Number(val))}
                                        placeholder="Select Category"
                                        error={errors.category_id}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Unit</label>
                                    <SearchableSelect
                                        options={units.map(u => ({ label: u.name, value: u.id }))}
                                        value={data.unit_id || ''}
                                        onChange={val => setData('unit_id', Number(val))}
                                        placeholder="Select Unit"
                                        error={errors.unit_id}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Base Price (৳)</label>
                                    <input
                                        type="number"
                                        value={data.price}
                                        onChange={e => setData('price', e.target.value)}
                                        className="w-full mt-1 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-sm bg-transparent dark:text-neutral-100"
                                        placeholder="0.00"
                                        required
                                    />
                                    {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
                                </div>

                            </div>
                            <div className="space-y-3">
                                <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">Outlet-wise Prices (Optional)</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    {outlets.map((outlet, idx) => (
                                        <div key={outlet.id}>
                                            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{outlet.name} Price</label>
                                            <input
                                                type="number"
                                                value={data.outlet_prices.find(op => op.outlet_id === outlet.id)?.price || ''}
                                                onChange={e => {
                                                    const newOutletPrices = [...data.outlet_prices];
                                                    const opIdx = newOutletPrices.findIndex(op => op.outlet_id === outlet.id);
                                                    if (opIdx > -1) {
                                                        newOutletPrices[opIdx].price = e.target.value;
                                                    } else {
                                                        newOutletPrices.push({ outlet_id: outlet.id, price: e.target.value });
                                                    }
                                                    setData('outlet_prices', newOutletPrices);
                                                }}
                                                className="w-full mt-1 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-sm bg-transparent dark:text-neutral-100"
                                                placeholder="Same as base"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
                                >
                                    {editingProduct ? 'Update Product' : 'Save Product'}
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
