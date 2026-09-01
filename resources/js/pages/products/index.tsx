import { SaveConfirmationModal } from '@/components/save-confirmation-modal';
import { TableRowActions } from '@/components/table-row-actions';
import { DataView, type DataViewColumn } from '@/components/ui/data-view';
import { FilterSelect } from '@/components/ui/filter-select';
import { FormButton } from '@/components/ui/form-button';
import { FormInput } from '@/components/ui/form-input';
import { FormLabel } from '@/components/ui/form-label';
import { FormSelect } from '@/components/ui/form-select';
import { Modal } from '@/components/ui/modal';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { useDataViewSearch } from '@/hooks/use-data-view-search';
import { useTableLoading } from '@/hooks/use-table-loading';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/format';
import { type BreadcrumbItem, Product } from '@/types';
import type { ProductsProps } from '@/types/pages/products';
import { Head, useForm } from '@inertiajs/react';
import { Package, Plus, Store, Tag, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Products',
        href: '/products',
    },
];

export default function Products({ products, categories, outlets, filters }: ProductsProps) {
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);
    const [outletToAdd, setOutletToAdd] = useState<number | ''>('');

    const { data, setData, post, put, reset, errors, processing, clearErrors, transform } = useForm({
        name: '',
        category_id: null as number | null,
        image: null as File | null,

        price: '',
        outlet_prices: [] as { outlet_id: number; price: string | number }[],
    });

    const {
        search,
        setSearch,
        perPage,
        setPerPage,
        filterValues,
        setFilter,
        reset: resetDataView,
    } = useDataViewSearch('products.index', filters, {}, 'created_at:desc', 300, { category_id: filters.category_id || '' });
    const isLoading = useTableLoading();

    const openCreateModal = () => {
        setEditingProduct(null);
        reset();
        clearErrors();
        setShowModal(true);
    };

    useEffect(() => {
        if (new URLSearchParams(window.location.search).get('action') === 'create') {
            openCreateModal();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        clearErrors();
        setOutletToAdd('');
        setData({
            name: product.name,
            category_id: product.category_id,
            image: null,
            price: product.price.toString(),
            outlet_prices: (product.outlet_prices ?? []).map((op) => ({ outlet_id: op.outlet_id, price: op.price })),
        });
        setShowModal(true);
    };

    // Rows with no price entered yet aren't sent — an empty outlet row shouldn't silently zero out that outlet's price.
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingProduct) {
            setShowSaveConfirm(true);
        } else {
            transform((data) => ({ ...data, outlet_prices: data.outlet_prices.filter((op) => op.price !== '') }));
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
            transform((data) => ({ ...data, outlet_prices: data.outlet_prices.filter((op) => op.price !== '') }));
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

    const columns: DataViewColumn<Product>[] = [
        {
            key: 'id',
            label: 'ID',
            className: 'font-mono text-xs text-neutral-500',
            render: (p) => p.id,
        },
        {
            key: 'actions',
            label: 'Actions',
            align: 'center',
            render: (p) => <TableRowActions id={p.id} label={p.name} edit={{ onClick: () => openEditModal(p) }} deleteRoute="products.destroy" />,
        },
        {
            key: 'name',
            label: 'Name',
            render: (p) => (
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
            ),
        },
        {
            key: 'category',
            label: 'Category',
            render: (p) => (
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                    {p.category?.name}
                </span>
            ),
        },
        {
            key: 'price',
            label: 'Price',
            align: 'right',
            className: 'font-bold text-neutral-900 dark:text-neutral-100',
            render: (p) => formatCurrency(Number(p.price)),
        },
    ];

    const renderProductCard = (p: Product) => (
        <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-neutral-500">#{p.id}</span>
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
                <TableRowActions id={p.id} label={p.name} edit={{ onClick: () => openEditModal(p) }} deleteRoute="products.destroy" />
            </div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products - Launverse" />
            <div className="space-y-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                            <Package className="h-4 w-4" />
                        </div>
                        <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Products</h1>
                    </div>
                    <FormButton onClick={openCreateModal} icon={<Plus className="h-4 w-4" />}>
                        Add Product
                    </FormButton>
                </div>

                <DataView
                    data={products.data}
                    getKey={(p) => p.id}
                    loading={isLoading}
                    emptyMessage="No products found"
                    search={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search products..."
                    filters={
                        <FilterSelect
                            icon={<Tag className="h-4 w-4" />}
                            containerClassName="w-full sm:w-56"
                            value={filterValues.category_id ?? ''}
                            onChange={(e) => setFilter('category_id', e.target.value)}
                        >
                            <option value="">All Categories</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </FilterSelect>
                    }
                    onReset={resetDataView}
                    viewKey="products"
                    defaultView="table"
                    columns={columns}
                    renderCard={renderProductCard}
                    pagination={products.links}
                    total={products.total}
                    perPage={perPage}
                    onPerPageChange={setPerPage}
                />
            </div>

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

                    {outlets.length > 1 && (
                        <div className="space-y-2">
                            <FormLabel>Outlet Prices (optional)</FormLabel>
                            <p className="-mt-1 text-xs text-neutral-400">
                                Overrides the base price only for the chosen outlet. Leave unset to use the base price everywhere.
                            </p>

                            <div className="flex gap-2 rounded-xl border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-800/40">
                                <div className="flex-1">
                                    <FormSelect
                                        value={outletToAdd}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (!val) return;
                                            const outletId = Number(val);
                                            if (data.outlet_prices.some((op) => op.outlet_id === outletId)) {
                                                setOutletToAdd('');
                                                return;
                                            }
                                            setData('outlet_prices', [...data.outlet_prices, { outlet_id: outletId, price: '' }]);
                                            setOutletToAdd('');
                                        }}
                                    >
                                        <option value="">Add an outlet price...</option>
                                        {outlets
                                            .filter((o) => !data.outlet_prices.some((op) => op.outlet_id === o.id))
                                            .map((o) => (
                                                <option key={o.id} value={o.id}>
                                                    {o.name}
                                                </option>
                                            ))}
                                    </FormSelect>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                {data.outlet_prices.map((op, idx) => {
                                    const outletName = outlets.find((o) => o.id === op.outlet_id)?.name;

                                    return (
                                        <div key={op.outlet_id} className="space-y-1">
                                            <div className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-white p-2 dark:border-neutral-800 dark:bg-neutral-900/60">
                                                <div className="flex flex-1 items-center gap-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                                                    <Store className="h-3.5 w-3.5 text-neutral-400" /> {outletName}
                                                </div>
                                                <input
                                                    type="number"
                                                    value={op.price}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        const newPrices = [...data.outlet_prices];
                                                        newPrices[idx] = { ...newPrices[idx], price: value === '' ? '' : Number(value) };
                                                        setData('outlet_prices', newPrices);
                                                    }}
                                                    placeholder="Price"
                                                    className="h-9 w-28 rounded-xl border border-neutral-200 bg-transparent px-2.5 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-neutral-800 dark:text-neutral-100"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setData(
                                                            'outlet_prices',
                                                            data.outlet_prices.filter((_, i) => i !== idx),
                                                        )
                                                    }
                                                    className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    title="Remove outlet price"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                            {errors[`outlet_prices.${idx}.price` as keyof typeof errors] && (
                                                <p className="pl-1 text-xs font-medium text-red-500">
                                                    {errors[`outlet_prices.${idx}.price` as keyof typeof errors]}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

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
