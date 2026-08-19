import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';
import { SaveConfirmationModal } from '@/components/save-confirmation-modal';
import { TableRowActions } from '@/components/table-row-actions';
import { FormButton } from '@/components/ui/form-button';
import { FormInput } from '@/components/ui/form-input';
import { FormLabel } from '@/components/ui/form-label';
import { Modal } from '@/components/ui/modal';
import { Pagination } from '@/components/ui/pagination';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/format';
import { type BreadcrumbItem, Product } from '@/types';
import type { ProductsProps } from '@/types/pages/products';
import { Head, router, useForm } from '@inertiajs/react';
import { Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Products',
        href: '/products',
    },
];

export default function Products({ products, categories, filters }: ProductsProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);

    const { data, setData, post, put, reset, errors, processing, clearErrors } = useForm({
        name: '',
        category_id: null as number | null,
        image: null as File | null,

        price: '',
    });

    useDebouncedSearch('products.index', search);

    const openCreateModal = () => {
        setEditingProduct(null);
        reset();
        clearErrors();
        setShowModal(true);
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        clearErrors();
        setData({
            name: product.name,
            category_id: product.category_id,
            image: null,
            price: product.price.toString(),
        });
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingProduct) {
            setShowSaveConfirm(true);
        } else {
            post(route('products.store'), {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
            });
        }
    };

    const confirmSave = () => {
        if (editingProduct) {
            put(route('products.update', editingProduct.id), {
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
        if (selectedIds.length === products.data.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(products.data.map((p) => p.id));
        }
    };

    const toggleSelect = (id: number) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products - Launverse" />
            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Products</h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">{products.total} items</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleBulkDelete}
                            className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors dark:border-red-800/50 dark:bg-red-900/20 dark:text-red-400"
                        >
                            <Trash2 className="h-4 w-4" />
                            {selectedIds.length > 0 ? `Delete Selected (${selectedIds.length})` : 'Delete All'}
                        </button>
                        <button
                            onClick={openCreateModal}
                            className="flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg dark:bg-neutral-100 dark:text-neutral-900"
                        >
                            <Plus className="h-4 w-4" /> Add Product
                        </button>
                    </div>
                </div>

                <div className="relative">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-xl border border-neutral-200 bg-transparent py-2.5 pr-4 pl-10 text-sm transition-all focus:ring-2 focus:ring-blue-500/30 focus:outline-none sm:w-80 dark:border-neutral-800"
                    />
                </div>

                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
                    {/* Desktop Table */}
                    <div className="hidden overflow-x-auto md:block">
                        <table className="w-full min-w-[600px] text-sm">
                            <thead>
                                <tr className="bg-neutral-50 text-xs tracking-wider text-neutral-500 uppercase dark:bg-neutral-800/50">
                                    <th className="px-5 py-3 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.length === products.data.length && products.data.length > 0}
                                            onChange={toggleSelectAll}
                                            className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500 dark:border-neutral-700"
                                        />
                                    </th>
                                    <th className="px-3 py-3 text-left font-semibold">ID</th>
                                    <th className="px-3 py-3 text-left font-semibold">Name</th>
                                    <th className="px-3 py-3 text-left font-semibold">Category</th>
                                    <th className="px-3 py-3 text-right font-semibold">Price</th>
                                    <th className="px-3 py-3 text-center font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.data.map((p) => (
                                    <tr
                                        key={p.id}
                                        className={`border-b border-neutral-50 transition-colors hover:bg-neutral-50/50 dark:border-neutral-800 dark:hover:bg-neutral-800/30 ${selectedIds.includes(p.id) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                    >
                                        <td className="px-5 py-3 text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(p.id)}
                                                onChange={() => toggleSelect(p.id)}
                                                className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500 dark:border-neutral-700"
                                            />
                                        </td>
                                        <td className="px-3 py-3 font-mono text-xs text-neutral-500">{p.id}</td>
                                        <td className="px-3 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800">
                                                    {p.image_url ? (
                                                        <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-xs font-bold text-neutral-400 uppercase">
                                                            {p.name.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="font-medium text-neutral-800 dark:text-neutral-200">{p.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3">
                                            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                                                {p.category?.name}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 text-right font-bold text-neutral-900 dark:text-neutral-100">
                                            {formatCurrency(Number(p.price))}
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="flex items-center justify-center">
                                                <TableRowActions
                                                    id={p.id}
                                                    label={p.name}
                                                    edit={{ onClick: () => openEditModal(p) }}
                                                    deleteRoute="products.destroy"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card Layout */}
                    <div className="divide-y divide-neutral-100 md:hidden dark:divide-neutral-800">
                        {products.data.map((p) => (
                            <div
                                key={p.id}
                                className={`space-y-3 bg-white p-4 dark:bg-neutral-900 ${selectedIds.includes(p.id) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(p.id)}
                                            onChange={() => toggleSelect(p.id)}
                                            className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500 dark:border-neutral-700"
                                        />
                                        <span className="font-mono text-[10px] text-neutral-500">#{p.id}</span>
                                    </div>
                                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                                        {p.category?.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800">
                                        {p.image_url ? (
                                            <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-sm font-bold text-neutral-400 uppercase">
                                                {p.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-bold text-neutral-900 dark:text-neutral-100">{p.name}</p>
                                        <p className="text-sm font-bold text-blue-600">{formatCurrency(Number(p.price))}</p>
                                    </div>
                                    <TableRowActions
                                        id={p.id}
                                        label={p.name}
                                        edit={{ onClick: () => openEditModal(p) }}
                                        deleteRoute="products.destroy"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <Pagination links={products.links} />
            </div>

            <DeleteConfirmationModal
                isOpen={showBulkDeleteModal}
                onClose={() => setShowBulkDeleteModal(false)}
                onConfirm={confirmBulkDelete}
                title={selectedIds.length > 0 ? 'Delete Selected Products' : 'Delete All Products'}
                description={
                    selectedIds.length > 0
                        ? `Are you sure you want to delete ${selectedIds.length} selected products?`
                        : 'Are you sure you want to delete ALL products? This will remove every product from the system.'
                }
                isProcessing={processing}
            />

            <SaveConfirmationModal
                isOpen={showSaveConfirm}
                onClose={() => setShowSaveConfirm(false)}
                onConfirm={confirmSave}
                title="Save Product Changes"
                description="Are you sure you want to save these changes to the product?"
                isProcessing={processing}
            />

            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    clearErrors();
                }}
                title={editingProduct ? 'Edit Product' : 'New Product'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <FormLabel>Product Image</FormLabel>
                        <div className="mt-1 flex items-center gap-4">
                            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800">
                                {data.image ? (
                                    <img src={URL.createObjectURL(data.image)} className="h-full w-full object-cover" />
                                ) : editingProduct?.image_url ? (
                                    <img src={editingProduct.image_url} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-neutral-400">
                                        <Plus className="h-6 w-6" />
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                onChange={(e) => setData('image', e.target.files?.[0] || null)}
                                className="text-xs text-neutral-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-neutral-800 dark:file:text-neutral-300"
                                accept="image/*"
                            />
                        </div>
                        {errors.image && <p className="mt-1 text-xs text-red-500">{errors.image}</p>}
                    </div>
                    <FormInput
                        label="Product Name"
                        required
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className="rounded-xl border-neutral-200 bg-transparent dark:border-neutral-800 dark:text-neutral-100"
                        placeholder="Enter product name (e.g. Cotton Shirt)"
                        error={errors.name}
                    />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <FormLabel required>Category</FormLabel>
                            <SearchableSelect
                                options={categories.map((c) => ({ label: c.name, value: c.id }))}
                                value={data.category_id || ''}
                                onChange={(val) => setData('category_id', Number(val))}
                                placeholder="Select Category"
                                error={errors.category_id}
                            />
                        </div>
                        <FormInput
                            label="Base Price (৳)"
                            required
                            type="number"
                            value={data.price}
                            onChange={(e) => setData('price', e.target.value)}
                            className="rounded-xl border-neutral-200 bg-transparent dark:border-neutral-800 dark:text-neutral-100"
                            placeholder="0.00"
                            error={errors.price}
                        />
                    </div>

                    <div className="flex gap-2 pt-2">
                        <FormButton type="submit" loading={processing} className="flex-1 rounded-xl">
                            {processing ? 'Saving...' : editingProduct ? 'Update Product' : 'Save Product'}
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
