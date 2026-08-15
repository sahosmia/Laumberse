import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';
import { SaveConfirmationModal } from '@/components/save-confirmation-modal';
import { TableRowActions } from '@/components/table-row-actions';
import { Modal } from '@/components/ui/modal';
import { Pagination } from '@/components/ui/pagination';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { CLIENT_TYPES, CLIENT_TYPE_STYLES, type ClientType } from '@/constants/status';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/format';
import { type BreadcrumbItem, Client } from '@/types';
import type { ClientsProps } from '@/types/pages/clients';
import { Head, useForm } from '@inertiajs/react';
import { PackagePlus, Plus, Search, Settings2, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Clients',
        href: '/clients',
    },
];

const typeBadgeClass = (type: ClientType) => CLIENT_TYPE_STYLES[type] ?? CLIENT_TYPE_STYLES.Consumer;

export default function Clients({ clients, products, filters }: ClientsProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [showModal, setShowModal] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);
    const [priceIndexToDelete, setPriceIndexToDelete] = useState<number | null>(null);

    const { data, setData, post, put, reset, errors, processing, clearErrors } = useForm({
        name: '',
        phone: '',
        type: 'Consumer' as ClientType,
        address: '',
        custom_prices: [] as { product_id: number; custom_price: string | number }[],
    });

    useDebouncedSearch('clients.index', search);

    const openCreateModal = () => {
        setEditingClient(null);
        reset();
        clearErrors();
        setShowModal(true);
    };

    const openEditModal = (client: Client) => {
        setEditingClient(client);
        clearErrors();
        setData({
            name: client.name,
            phone: client.phone,
            type: client.type,
            address: client.address || '',
            custom_prices: client.custom_prices?.map((cp) => ({ product_id: cp.product_id, custom_price: cp.custom_price })) || [],
        });
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingClient) {
            setShowSaveConfirm(true);
        } else {
            const payload = {
                ...data,
                custom_prices: data.custom_prices.filter((cp) => cp.product_id && cp.custom_price !== ''),
            };
            post(route('clients.store'), {
                data: payload,
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
            });
        }
    };

    const confirmSave = () => {
        if (editingClient) {
            const payload = {
                ...data,
                custom_prices: data.custom_prices.filter((cp) => cp.product_id && cp.custom_price !== ''),
            };
            put(route('clients.update', editingClient.id), {
                data: payload,
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
            <Head title="Clients" />
            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Clients</h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">{clients.total} registered clients</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg dark:bg-neutral-100 dark:text-neutral-900"
                    >
                        <Plus className="h-4 w-4" /> Add Client
                    </button>
                </div>

                <div className="relative">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search clients..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-xl border border-neutral-200 bg-transparent py-2.5 pr-4 pl-10 text-sm transition-all focus:ring-2 focus:ring-blue-500/30 focus:outline-none sm:w-80 dark:border-neutral-800"
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {clients.data.map((c) => (
                        <div
                            key={c.id}
                            className="group relative rounded-2xl border border-neutral-200 bg-white p-5 transition-shadow duration-300 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
                        >
                            <div className="absolute top-4 right-4 z-10">
                                <TableRowActions
                                    id={c.id}
                                    label={c.name}
                                    view={{ href: route('clients.show', c.id) }}
                                    edit={{ onClick: () => openEditModal(c) }}
                                    deleteRoute="clients.destroy"
                                />
                            </div>
                            <div className="mb-3 flex items-start justify-between">
                                <div className="pr-16">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h4 className="text-sm font-bold break-words text-neutral-900 sm:text-base dark:text-neutral-100">
                                            {c.name}
                                        </h4>
                                        <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase ${typeBadgeClass(c.type)}`}>
                                            {c.type}
                                        </span>
                                    </div>
                                    <p className="mt-0.5 font-mono text-xs font-semibold text-blue-600">{c.client_uuid}</p>
                                    <p className="mt-0.5 text-xs break-all text-neutral-400">{c.phone}</p>
                                    <p className="mt-0.5 line-clamp-2 text-xs text-neutral-400">{c.address || '-'}</p>
                                </div>
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/20">
                                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{c.name.charAt(0)}</span>
                                </div>
                            </div>
                            <div className="mt-4 grid grid-cols-3 gap-2">
                                <div className="min-w-0 rounded-xl bg-neutral-50 p-2.5 text-center dark:bg-neutral-800/50">
                                    <p className="truncate text-sm font-bold text-neutral-900 sm:text-base lg:text-lg dark:text-neutral-100">
                                        {c.total_orders}
                                    </p>
                                    <p className="truncate text-[9px] font-medium tracking-wider text-neutral-500 uppercase sm:text-[10px]">Orders</p>
                                </div>
                                <div className="min-w-0 rounded-xl bg-emerald-50 p-2.5 text-center dark:bg-emerald-900/20">
                                    <p className="truncate text-sm font-bold text-emerald-600 sm:text-base lg:text-lg dark:text-emerald-400">
                                        {formatCurrency(Number(c.total_paid))}
                                    </p>
                                    <p className="truncate text-[9px] font-medium tracking-wider text-emerald-600 uppercase sm:text-[10px]">Paid</p>
                                </div>
                                <div className="min-w-0 rounded-xl bg-red-50 p-2.5 text-center dark:bg-red-900/20">
                                    <p className="truncate text-sm font-bold text-red-500 sm:text-base lg:text-lg dark:text-red-400">
                                        {formatCurrency(Number(c.total_due))}
                                    </p>
                                    <p className="truncate text-[9px] font-medium tracking-wider text-red-500 uppercase sm:text-[10px]">Due</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <Pagination links={clients.links} />
            </div>

            <SaveConfirmationModal
                isOpen={showSaveConfirm}
                onClose={() => setShowSaveConfirm(false)}
                onConfirm={confirmSave}
                title="Save Client Changes"
                description="Are you sure you want to save these changes to the client?"
                isProcessing={processing}
            />

            <DeleteConfirmationModal
                isOpen={priceIndexToDelete !== null}
                onClose={() => setPriceIndexToDelete(null)}
                onConfirm={() => {
                    if (priceIndexToDelete !== null) {
                        setData(
                            'custom_prices',
                            data.custom_prices.filter((_, i) => i !== priceIndexToDelete),
                        );
                    }
                    setPriceIndexToDelete(null);
                }}
                title="Remove Product Price"
                description="Are you sure you want to remove this product's custom price from the client?"
                confirmText="Remove"
            />

            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    clearErrors();
                }}
                title={editingClient ? 'Edit Client' : 'New Client'}
                size="xl"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name Input */}
                    <div>
                        <label htmlFor="client_name" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            Name
                        </label>
                        <input
                            id="client_name"
                            type="text"
                            value={data.name}
                            disabled={processing}
                            onChange={(e) => setData('name', e.target.value)}
                            className="mt-1 h-12 w-full rounded-xl border border-neutral-200 bg-transparent px-3 text-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none disabled:opacity-60 md:h-10 dark:border-neutral-800 dark:text-neutral-100"
                            placeholder="John Doe"
                            required
                        />
                        {errors.name && <p className="mt-1 text-xs font-medium text-red-500">{errors.name}</p>}
                    </div>

                    {/* Phone & Type Rows */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="client_phone" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Phone
                            </label>
                            <input
                                id="client_phone"
                                type="tel"
                                value={data.phone}
                                disabled={processing}
                                onChange={(e) => setData('phone', e.target.value)}
                                className="mt-1 h-12 w-full rounded-xl border border-neutral-200 bg-transparent px-3 text-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none disabled:opacity-60 md:h-10 dark:border-neutral-800 dark:text-neutral-100"
                                placeholder="+1 (555) 000-0000"
                                required
                            />
                            {errors.phone && <p className="mt-1 text-xs font-medium text-red-500">{errors.phone}</p>}
                        </div>
                        <div>
                            <label htmlFor="client_type" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Type
                            </label>
                            <select
                                id="client_type"
                                value={data.type}
                                disabled={processing}
                                onChange={(e) => setData('type', e.target.value as ClientType)}
                                className="mt-1 h-12 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none disabled:opacity-60 md:h-10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                            >
                                {CLIENT_TYPES.map((t) => (
                                    <option key={t} value={t} className="bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
                                        {t}
                                    </option>
                                ))}
                            </select>
                            {errors.type && <p className="mt-1 text-xs font-medium text-red-500">{errors.type}</p>}
                        </div>
                    </div>

                    {/* Address Input */}
                    <div>
                        <label htmlFor="client_address" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            Address
                        </label>
                        <textarea
                            id="client_address"
                            value={data.address}
                            disabled={processing}
                            onChange={(e) => setData('address', e.target.value)}
                            className="mt-1 w-full rounded-xl border border-neutral-200 bg-transparent px-3 py-2 text-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none disabled:opacity-60 dark:border-neutral-800 dark:text-neutral-100"
                            rows={2}
                            placeholder="Street details, City, Postcode"
                        />
                        {errors.address && <p className="mt-1 text-xs font-medium text-red-500">{errors.address}</p>}
                    </div>

                    {/* Conditional Corporate section */}
                    {data.type === 'Corporate' && (
                        <div className="animate-fade-in space-y-3 pt-2">
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-neutral-100">
                                    <Settings2 className="h-4 w-4 text-purple-500" /> Corporate Pricing
                                </label>
                            </div>

                            {/* Search and Quick Add component container */}
                            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-800/40">
                                <p className="mb-2 flex items-center gap-1 text-[10px] font-bold tracking-wider text-neutral-400 uppercase dark:text-neutral-500">
                                    <PackagePlus className="h-3 w-3" /> Quick Add Product
                                </p>
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <SearchableSelect
                                            key={data.custom_prices.length}
                                            value={selectedProduct || ''}
                                            options={products.map((p) => ({
                                                label: p.name,
                                                value: p.id,
                                            }))}
                                            disabled={processing}
                                            placeholder="Search product to add..."
                                            onChange={(val) => {
                                                if (!val) return;

                                                const productId = Number(val);

                                                // Prevent duplicate
                                                if (data.custom_prices.some((cp) => cp.product_id === productId)) {
                                                    setSelectedProduct(null);
                                                    return;
                                                }

                                                const product = products.find((p) => p.id === productId);

                                                if (!product) {
                                                    setSelectedProduct(null);
                                                    return;
                                                }

                                                setData('custom_prices', [
                                                    ...data.custom_prices,
                                                    {
                                                        product_id: product.id,
                                                        custom_price: '',
                                                    },
                                                ]);

                                                // Reset select after successful add
                                                setSelectedProduct(null);
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Custom Price Listings */}
                            <div className="custom-scrollbar max-h-48 space-y-2 overflow-y-auto pr-1">
                                {data.custom_prices.map((cp, idx) => {
                                    const currentProduct = products.find((p) => p.id == cp.product_id);

                                    return (
                                        <div key={idx} className="space-y-1">
                                            <div className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-white p-2 transition-all hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900/60 dark:hover:border-neutral-700">
                                                <div className="line-clamp-1 flex-1 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                                                    {currentProduct?.name}
                                                    {currentProduct?.price && (
                                                        <span className="block text-[10px] font-normal text-neutral-400">
                                                            Regular: {currentProduct.price}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        value={cp.custom_price}
                                                        disabled={processing}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            const newPrices = [...data.custom_prices];
                                                            newPrices[idx].custom_price = value === '' ? '' : Number(value);
                                                            setData('custom_prices', newPrices);
                                                        }}
                                                        placeholder="Custom Price"
                                                        className="h-12 w-28 rounded-xl border border-neutral-200 bg-transparent px-2.5 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none disabled:opacity-60 sm:h-9 sm:w-32 dark:border-neutral-800 dark:text-neutral-100"
                                                    />
                                                    <button
                                                        type="button"
                                                        disabled={processing}
                                                        onClick={() => setPriceIndexToDelete(idx)}
                                                        className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-900/20"
                                                        title="Remove price profile"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {errors[`custom_prices.${idx}.custom_price` as keyof typeof errors] && (
                                                <p className="pl-1 text-xs font-medium text-red-500">
                                                    {errors[`custom_prices.${idx}.custom_price` as keyof typeof errors]}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}

                                {data.custom_prices.length === 0 && (
                                    <p className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50/30 py-6 text-center text-xs text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900/20 dark:text-neutral-500">
                                        No custom prices set. This client will get default catalog prices.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-6 flex items-center gap-3 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                        <button
                            type="button"
                            onClick={() => {
                                setShowModal(false);
                                clearErrors();
                            }}
                            className="flex-1 rounded-xl bg-neutral-100 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing ? (
                                <>
                                    <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <span>{editingClient ? 'Update Client' : 'Save Client'}</span>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
