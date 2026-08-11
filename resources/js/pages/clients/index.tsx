import { Head, useForm } from '@inertiajs/react';
import { useState } from "react";
import { Search, Plus, Settings2, PackagePlus, Trash2 } from "lucide-react";
import AppLayout from '@/layouts/app-layout';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { type BreadcrumbItem, Client } from '@/types';
import { SaveConfirmationModal } from '@/components/save-confirmation-modal';
import { Modal } from '@/components/ui/modal';
import { Pagination } from '@/components/ui/pagination';
import { TableRowActions } from '@/components/table-row-actions';
import { CLIENT_TYPES, CLIENT_TYPE_STYLES, type ClientType } from '@/constants/status';
import { formatCurrency } from '@/lib/format';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import type { ClientsProps } from '@/types/pages/clients';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Clients',
        href: '/clients',
    },
];


const typeBadgeClass = (type: ClientType) => CLIENT_TYPE_STYLES[type] ?? CLIENT_TYPE_STYLES.Consumer;

export default function Clients({ clients, products, filters }: ClientsProps) {
    const [search, setSearch] = useState(filters.search || "");
    const [showModal, setShowModal] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);

    const { data, setData, post, put, reset, errors, processing } = useForm({
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
        setShowModal(true);
    };

    const openEditModal = (client: Client) => {
        setEditingClient(client);
        setData({
            name: client.name,
            phone: client.phone,
            type: client.type,
            address: client.address || '',
            custom_prices: client.custom_prices?.map(cp => ({ product_id: cp.product_id, custom_price: cp.custom_price })) || [],
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
            custom_prices: data.custom_prices.filter(
                cp => cp.product_id && cp.custom_price !== ''
            ),
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
            custom_prices: data.custom_prices.filter(
                cp => cp.product_id && cp.custom_price !== ''
            ),
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
            <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Clients</h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">{clients.total} registered clients</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg"
                    >
                        <Plus className="w-4 h-4" /> Add Client
                    </button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search clients..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full sm:w-80 pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {clients.data.map((c) => (
                        <div key={c.id} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 hover:shadow-lg transition-shadow duration-300 relative group">
                            <div className="absolute top-4 right-4 z-10">
                                <TableRowActions
                                    id={c.id}
                                    label={c.name}
                                    view={{ href: route('clients.show', c.id) }}
                                    edit={{ onClick: () => openEditModal(c) }}
                                    deleteRoute="clients.destroy"
                                />
                            </div>
                            <div className="flex items-start justify-between mb-3">
                                <div className="pr-16">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm sm:text-base break-words">{c.name}</h4>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase ${typeBadgeClass(c.type)}`}>
                                            {c.type}
                                        </span>
                                    </div>
                                    <p className="text-xs text-neutral-400 mt-0.5 break-all">{c.phone}</p>
                                    <p className="text-xs text-neutral-400 mt-0.5 line-clamp-2">{c.address || '-'}</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{c.name.charAt(0)}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 mt-4">
                                <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-2.5 text-center min-w-0">
                                    <p className="text-sm sm:text-base lg:text-lg font-bold text-neutral-900 dark:text-neutral-100 truncate">{c.total_orders}</p>
                                    <p className="text-[9px] sm:text-[10px] text-neutral-500 font-medium uppercase tracking-wider truncate">Orders</p>
                                </div>
                                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-2.5 text-center min-w-0">
                                    <p className="text-sm sm:text-base lg:text-lg font-bold text-emerald-600 dark:text-emerald-400 truncate">{formatCurrency(Number(c.total_paid))}</p>
                                    <p className="text-[9px] sm:text-[10px] text-emerald-600 font-medium uppercase tracking-wider truncate">Paid</p>
                                </div>
                                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-2.5 text-center min-w-0">
                                    <p className="text-sm sm:text-base lg:text-lg font-bold text-red-500 dark:text-red-400 truncate">{formatCurrency(Number(c.total_due))}</p>
                                    <p className="text-[9px] sm:text-[10px] text-red-500 font-medium uppercase tracking-wider truncate">Due</p>
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

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingClient ? 'Edit Client' : 'New Client'} size="xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Input */}
                <div>
                    <label htmlFor="client_name" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Name</label>
                    <input
                        id="client_name"
                        type="text"
                        value={data.name}
                        disabled={processing}
                        onChange={e => setData('name', e.target.value)}
                        className="w-full mt-1 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 h-12 md:h-10 text-sm bg-transparent dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-60 transition-all"
                        placeholder="John Doe"
                        required
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1 font-medium">{errors.name}</p>}
                </div>

                {/* Phone & Type Rows */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="client_phone" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Phone</label>
                        <input
                            id="client_phone"
                            type="tel"
                            value={data.phone}
                            disabled={processing}
                            onChange={e => setData('phone', e.target.value)}
                            className="w-full mt-1 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 h-12 md:h-10 text-sm bg-transparent dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-60 transition-all"
                            placeholder="+1 (555) 000-0000"
                            required
                        />
                        {errors.phone && <p className="text-xs text-red-500 mt-1 font-medium">{errors.phone}</p>}
                    </div>
                    <div>
                        <label htmlFor="client_type" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Type</label>
                        <select
                            id="client_type"
                            value={data.type}
                            disabled={processing}
                            onChange={e => setData('type', e.target.value as ClientType)}
                            className="w-full mt-1 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 h-12 md:h-10 text-sm bg-white dark:bg-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-60 transition-all"
                        >
                            {CLIENT_TYPES.map(t => (
                                <option key={t} value={t} className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">{t}</option>
                            ))}
                        </select>
                        {errors.type && <p className="text-xs text-red-500 mt-1 font-medium">{errors.type}</p>}
                    </div>
                </div>

                {/* Address Input */}
                <div>
                    <label htmlFor="client_address" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Address</label>
                    <textarea
                        id="client_address"
                        value={data.address}
                        disabled={processing}
                        onChange={e => setData('address', e.target.value)}
                        className="w-full mt-1 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-sm bg-transparent dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-60 transition-all"
                        rows={2}
                        placeholder="Street details, City, Postcode"
                    />
                    {errors.address && <p className="text-xs text-red-500 mt-1 font-medium">{errors.address}</p>}
                </div>

                {/* Conditional Corporate section */}
                {data.type === 'Corporate' && (
                    <div className="space-y-3 pt-2 animate-fade-in">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                                <Settings2 className="w-4 h-4 text-purple-500" /> Corporate Pricing
                            </label>
                        </div>

                        {/* Search and Quick Add component container */}
                        <div className="bg-neutral-50 dark:bg-neutral-800/40 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800">
                            <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                <PackagePlus className="w-3 h-3" /> Quick Add Product
                            </p>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                   <SearchableSelect
    value={selectedProduct}
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
        if (data.custom_prices.some(cp => cp.product_id === productId)) {
            setSelectedProduct(null);
            return;
        }

        const product = products.find(
            p => p.id === productId
        );

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
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                            {data.custom_prices.map((cp, idx) => {
                                const currentProduct = products.find(p => p.id == cp.product_id);

                                return (
                                    <div key={idx} className="space-y-1">
                                        <div className="flex gap-3 items-center bg-white dark:bg-neutral-900/60 p-2 rounded-xl border border-neutral-100 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all">
                                            <div className="flex-1 text-xs font-medium text-neutral-700 dark:text-neutral-300 line-clamp-1">
                                                {currentProduct?.name}
                                                {currentProduct?.price && (
                                                    <span className="block text-[10px] text-neutral-400 font-normal">
                                                        Regular: {currentProduct.price}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    value={cp.custom_price}
                                                    disabled={processing}
                                                    onChange={e => {
                                                        const value = e.target.value;
                                                        const newPrices = [...data.custom_prices];
                                                        newPrices[idx].custom_price = value === "" ? "" : Number(value);
                                                        setData('custom_prices', newPrices);
                                                    }}
                                                    placeholder="Custom Price"
                                                    className="w-28 sm:w-32 border border-neutral-200 dark:border-neutral-800 rounded-xl px-2.5 h-12 sm:h-9 text-xs bg-transparent dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-60"
                                                />
                                                <button
                                                    type="button"
                                                    disabled={processing}
                                                    onClick={() => setData('custom_prices', data.custom_prices.filter((_, i) => i !== idx))}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg disabled:opacity-50 transition-colors"
                                                    title="Remove price profile"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {errors[`custom_prices.${idx}.custom_price` as keyof typeof errors] && (
                                            <p className="text-xs text-red-500 pl-1 font-medium">
                                                {errors[`custom_prices.${idx}.custom_price` as keyof typeof errors]}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}

                            {data.custom_prices.length === 0 && (
                                <p className="text-center py-6 text-xs text-neutral-400 dark:text-neutral-500 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50/30 dark:bg-neutral-900/20">
                                    No custom prices set. This client will get default catalog prices.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800 mt-6">
                    <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="flex-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 py-2.5 rounded-xl text-sm font-semibold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10"
                    >
                        {processing ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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
