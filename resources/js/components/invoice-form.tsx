import { useForm } from '@inertiajs/react';
import { useState, useMemo } from "react";
import { Search, Package, Trash2, Printer, Calendar, CreditCard, Users, UserPlus, Building2 } from "lucide-react";
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Category, Outlet, Product, Client } from '@/types';
import { SaveConfirmationModal } from '@/components/save-confirmation-modal';

export interface InvoiceItem {
    productId: number;
    name: string;
    price: number;
    qty: number;
    imageUrl?: string | null;
}

export interface Invoice {
    id?: number;
    invoice_uuid: string;
    outlet_id: number;
    date: string;
    client_id: number | string | null;
    total: number;
    paid: string | number;
    due: number;
    status: string;
    method: string;
    remarks: string;
    discount_type: string;
    discount_amount: number;
    items: {
        product_id: number;
        qty: number;
        price: number;
        product?: {
            name: string;
            image_url?: string | null;
        }
    }[];
}

interface InvoiceFormProps {
    invoice?: Invoice;
    products: Product[];
    clients: Client[];
    categories: Category[];
    outlets: Outlet[];
    isEdit?: boolean;
}

const formatCurrency = (n: number) => `৳${n.toLocaleString("en-BD")}`;
const generateInvoiceUuid = () => `INV-${Date.now().toString().slice(-8)}`;

export default function InvoiceForm({ invoice, products, clients, categories, outlets, isEdit = false }: InvoiceFormProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);

    const { data, setData, post, put, processing, errors } = useForm({
        invoice_uuid: invoice?.invoice_uuid || generateInvoiceUuid(),
        outlet_id: invoice?.outlet_id || (outlets.length > 0 ? outlets[0].id : null) as number | null,
        date: invoice?.date || new Date().toISOString().split('T')[0],
        client_id: invoice?.client_id || null as string | number | null,
        create_new_client: false,
        new_client_name: '',
        new_client_phone: '',
        new_client_type: 'Consumer',
        new_client_address: '',
        total: invoice?.total || 0,
        paid: invoice?.paid || 0 as string | number,
        due: invoice?.due || 0,
        status: invoice?.status || 'Processing',
        method: invoice?.method || 'Cash',
        remarks: invoice?.remarks || '',
        discount_type: invoice?.discount_type || 'Fixed',
        discount_amount: invoice?.discount_amount !== undefined ? invoice.discount_amount : '' as string | number,
        delivery_charge: invoice?.delivery_charge !== undefined ? invoice.delivery_charge : '' as string | number,
        items: invoice?.items.map(item => ({
            productId: item.product_id,
            name: item.product?.name || 'Unknown Product',
            price: Number(item.price),
            qty: item.qty,
            imageUrl: item.product?.image_url || null
        })) || [] as InvoiceItem[],
    });

    const filtered = useMemo(() => {
        return products.filter((p) => {
            const matchCat = selectedCategory === "All" || p.category?.name === selectedCategory;
            const matchSearch = searchTerm.length === 0 || p.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchCat && matchSearch;
        });
    }, [searchTerm, selectedCategory, products]);

    const calculateTotals = (items: InvoiceItem[], paid: number | string, discountType: string, discountAmount: number | string, deliveryCharge?: number | string) => {
        const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
        const disc = Number(discountAmount) || 0;
        let discountValue = 0;
        if (discountType === 'Percentage') {
            discountValue = (subtotal * disc) / 100;
        } else {
            discountValue = disc;
        }
        const deliv = Number(deliveryCharge !== undefined ? deliveryCharge : data.delivery_charge) || 0;
        const total = Math.max(0, subtotal - discountValue) + deliv;
        const due = total - (Number(paid) || 0);
        return { total, due };
    };

    const handleDeliveryChargeChange = (val: string) => {
        const { total, due } = calculateTotals(data.items, data.paid, data.discount_type, data.discount_amount, val);
        setData(d => ({
            ...d,
            delivery_charge: val,
            total,
            due
        }));
    };

    const addItem = (product: Product) => {
        const existingIdx = data.items.findIndex((i) => i.productId === product.id);
        let newItems = [...data.items];

        const selectedClient = clients.find(c => c.id == data.client_id);
        let price = Number(product.price);

        if (selectedClient?.type === 'Corporate') {
            const customPrice = selectedClient.custom_prices?.find(cp => cp.product_id === product.id)?.custom_price;
            if (customPrice !== undefined) {
                price = Number(customPrice);
            }
        } else {
            const outletPrice = product.outlet_prices?.find(op => op.outlet_id === Number(data.outlet_id))?.price;
            if (outletPrice !== undefined) {
                price = Number(outletPrice);
            }
        }

        if (existingIdx > -1) {
            newItems[existingIdx].qty += 1;
            newItems[existingIdx].price = price; // Update price in case outlet changed

        } else {
            newItems.push({
                productId: product.id,
                name: product.name,
                price: price,
                qty: 1,
                imageUrl: product.image_url
            });
        }


        const { total } = calculateTotals(newItems, data.paid, data.discount_type, data.discount_amount);
        setData(d => ({
            ...d,
            items: newItems,
            total,
            paid: total,
            due: 0
        }));

        setSearchTerm("");
        setShowDropdown(false);
    };

    const updateQty = (idx: number, newQty: number) => {
        if (newQty < 1) return;
        let newItems = [...data.items];
        newItems[idx].qty = newQty;

        const { total } = calculateTotals(newItems, data.paid, data.discount_type, data.discount_amount);
        setData(d => ({
            ...d,
            items: newItems,
            total,
            paid: total,
            due: 0
        }));
    };

    const updatePrice = (idx: number, newPrice: number) => {
        let newItems = [...data.items];
        newItems[idx].price = newPrice;

        const { total } = calculateTotals(newItems, data.paid, data.discount_type, data.discount_amount);
        setData(d => ({
            ...d,
            items: newItems,
            total,
            paid: total,
            due: 0
        }));
    };

    const removeItem = (idx: number) => {
        const newItems = data.items.filter((_, i) => i !== idx);
        const { total } = calculateTotals(newItems, data.paid, data.discount_type, data.discount_amount);
        setData(d => ({
            ...d,
            items: newItems,
            total,
            paid: total,
            due: 0
        }));
    };

    const handlePaidChange = (val: string) => {
        const { total } = calculateTotals(data.items, val, data.discount_type, data.discount_amount);
        setData(d => ({
            ...d,
            paid: val,
            due: total - (Number(val) || 0)
        }));
    };

    const handleDiscountTypeChange = (type: string) => {
        const { total } = calculateTotals(data.items, data.paid, type, data.discount_amount);
        setData(d => ({
            ...d,
            discount_type: type,
            total,
            paid: total,
            due: 0
        }));
    };

    const handleDiscountAmountChange = (val: string) => {
        const { total } = calculateTotals(data.items, data.paid, data.discount_type, val);
        setData(d => ({
            ...d,
            discount_amount: val,
            total,
            paid: total,
            due: 0
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit && invoice?.id) {
            setShowSaveConfirm(true);
        } else {
            post(route('invoices.store'));
        }
    };

    const confirmSave = () => {
        if (isEdit && invoice?.id) {
            put(route('invoices.update', invoice.id), {
                onSuccess: () => setShowSaveConfirm(false),
                onError: () => setShowSaveConfirm(false),
            });
        }
    };

    const usedCategoryIds = new Set(products.map(p => p.category_id));
    const activeCategories = categories.filter(c => usedCategoryIds.has(c.id));
    const categoryNames = ["All", ...activeCategories.map(c => c.name)];
    const clientOptions = clients.map(c => ({ label: `${c.name} (${c.phone})`, value: c.id }));
    const outletOptions = outlets.map(o => ({ label: o.name, value: o.id }));

    const selectedClient = clients.find(c => c.id == data.client_id);
    // const isCorporate = selectedClient?.type === 'Corporate';
    const isCorporate = data.create_new_client
    ? data.new_client_type === 'Corporate'
    : selectedClient?.type === 'Corporate';

    return (
        <>
            <SaveConfirmationModal
                isOpen={showSaveConfirm}
                onClose={() => setShowSaveConfirm(false)}
                onConfirm={confirmSave}
                title="Save Invoice Changes"
                description="Are you sure you want to save these changes to the invoice?"
                isProcessing={processing}
            />
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{isEdit ? 'Edit Invoice' : 'Create Invoice'}</h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">POS — quick service entry</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-neutral-400">Invoice No.</p>
                    <Input
                        value={data.invoice_uuid}
                        onChange={e => setData('invoice_uuid', e.target.value)}
                        className="h-8 text-sm font-bold text-neutral-700 dark:text-neutral-300 font-mono text-right"
                    />
                    {errors.invoice_uuid && <p className="text-[10px] text-red-500">{errors.invoice_uuid}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4">

                    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                                <Users className="w-4 h-4" /> Client
                            </h3>
                            {!isEdit && (
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="create_new_client"
                                        checked={data.create_new_client}
                                        onCheckedChange={(checked) => setData('create_new_client', !!checked)}
                                    />
                                    <Label htmlFor="create_new_client" className="text-xs font-medium cursor-pointer">New Client</Label>
                                </div>
                            )}
                        </div>

                        {!data.create_new_client ? (
                            <div>
                                <SearchableSelect
                                    options={clientOptions}
                                    value={data.client_id}
                                    onChange={(val) => {
                                        const newClient = clients.find(c => c.id == val);
                                        if (newClient?.type === 'Corporate') {
                                            // Automatically populate items with custom prices for Corporate clients
                                            const corporateItems = (newClient.custom_prices || []).map(cp => {
                                                const product = products.find(p => p.id === cp.product_id);
                                                if (!product) return null;
                                                return {
                                                    productId: product.id,
                                                    name: product.name,
                                                    price: Number(cp.custom_price),
                                                    qty: 1,
                                                    imageUrl: product.image_url
                                                };
                                            }).filter(Boolean) as InvoiceItem[];

                                            const { total } = calculateTotals(corporateItems, data.paid, data.discount_type, data.discount_amount);
                                            setData(d => ({
                                                ...d,
                                                client_id: val,
                                                items: corporateItems,
                                                total,
                                                paid: total,
                                                due: 0,
                                                outlet_id: null // Corporate clients don't use outlets
                                            }));
                                        } else {
                                            // For regular clients, clear items if it was previously corporate populated or keep it
                                            // The user specifically asked: "if i select any corporate client that time show his all selected product or items but after select any corporate client if i select any consumer client so selected box so old corporate client products list"
                                            // This suggests we should clear the list when switching to a consumer client.
                                            const { total } = calculateTotals([], data.paid, data.discount_type, data.discount_amount);
                                            setData(d => ({
                                                ...d,
                                                client_id: val,
                                                items: [],
                                                total,
                                                paid: total,
                                                due: 0
                                            }));
                                        }
                                    }}
                                    placeholder="Select Client"
                                    error={errors.client_id}
                                />
                            </div>
                        ) : (
                            <div className="space-y-3 p-3 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/20">
                                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">
                                    <UserPlus className="w-3 h-3" /> Inline Client Creation
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new_client_name" className="text-[10px] uppercase tracking-wider text-neutral-500">Name</Label>
                                    <Input
                                        id="new_client_name"
                                        value={data.new_client_name}
                                        onChange={e => setData('new_client_name', e.target.value)}
                                        placeholder="Client Name"
                                        className="h-12 md:h-9 text-sm md:text-xs"
                                    />
                                    {errors.new_client_name && <p className="text-[10px] text-red-500">{errors.new_client_name}</p>}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="new_client_phone" className="text-[10px] uppercase tracking-wider text-neutral-500">Phone</Label>
                                        <Input
                                            id="new_client_phone"
                                            value={data.new_client_phone}
                                            onChange={e => setData('new_client_phone', e.target.value)}
                                            placeholder="Phone Number"
                                            className="h-12 md:h-9 text-sm md:text-xs"
                                        />
                                        {errors.new_client_phone && <p className="text-[10px] text-red-500">{errors.new_client_phone}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="new_client_type" className="text-[10px] uppercase tracking-wider text-neutral-500">Type</Label>
                                        <select
                                            id="new_client_type"
                                            value={data.new_client_type}
                                            onChange={e => setData('new_client_type', e.target.value)}
                                            className="w-full border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 h-12 md:h-9 text-sm md:text-xs bg-transparent dark:text-neutral-100"
                                        >
                                            <option value="Consumer">Consumer</option>
                                            <option value="Corporate">Corporate</option>
                                        </select>
                                        {errors.new_client_type && <p className="text-[10px] text-red-500">{errors.new_client_type}</p>}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new_client_address" className="text-[10px] uppercase tracking-wider text-neutral-500">Address (Optional)</Label>
                                    <Input
                                        id="new_client_address"
                                        value={data.new_client_address}
                                        onChange={e => setData('new_client_address', e.target.value)}
                                        placeholder="Address"
                                        className="h-12 md:h-9 text-sm md:text-xs"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5">
                        <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
                            <Search className="w-4 h-4" /> Add Product
                        </h3>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Search product..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setShowDropdown(true); }}
                                onFocus={() => setShowDropdown(true)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                            />
                            {showDropdown && (searchTerm.length > 0 || selectedCategory !== "All") && (
                                <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl max-h-72 overflow-y-auto">
                                    {filtered.length === 0 ? (
                                        <div className="p-4 text-sm text-neutral-400 text-center">No products found</div>
                                    ) : (
                                        filtered.slice(0, 20).map((p) => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => addItem(p)}
                                                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left border-b border-neutral-50 dark:border-neutral-800 last:border-0"
                                            >
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
                                                    <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{p.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-blue-600">
                                                        {(() => {
                                                            if (isCorporate) {
                                                                const cp = selectedClient?.custom_prices?.find(cp => cp.product_id === p.id);
                                                                return formatCurrency(cp ? Number(cp.custom_price) : Number(p.price));
                                                            }
                                                            return formatCurrency(Number(p.outlet_prices?.find(op => op.outlet_id === Number(data.outlet_id))?.price ?? p.price));
                                                        })()}
                                                    </span>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                        <div className="px-5 py-3 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
                            <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Invoice Items ({data.items.length})</h3>
                            {errors.items && <p className="text-xs text-red-500">{errors.items}</p>}
                        </div>
                        {data.items.length === 0 ? (
                            <div className="p-10 text-center">
                                <Package className="w-10 h-10 text-neutral-200 dark:text-neutral-800 mx-auto mb-2" />
                                <p className="text-sm text-neutral-400">No items added yet.</p>
                            </div>
                        ) : (
                            <>
                                {/* Desktop Table View */}
                                <div className="hidden lg:block overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 text-xs uppercase tracking-wider">
                                                <th className="text-left px-5 py-2.5 font-semibold">#</th>
                                                <th className="text-left px-3 py-2.5 font-semibold">Service</th>
                                                <th className="text-center px-3 py-2.5 font-semibold w-24">Qty</th>
                                                <th className="text-right px-3 py-2.5 font-semibold w-28">Price</th>
                                                <th className="text-right px-3 py-2.5 font-semibold w-28">Total</th>
                                                <th className="text-center px-3 py-2.5 font-semibold w-12"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.items.map((item, idx: number) => (
                                                <tr key={idx} className="border-b border-neutral-50 dark:border-neutral-800 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                                                    <td className="px-5 py-3 text-neutral-400 font-mono text-xs">{idx + 1}</td>
                                                    <td className="px-3 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex-shrink-0 overflow-hidden border border-neutral-200 dark:border-neutral-800">
                                                                {item.imageUrl ? (
                                                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-neutral-400 font-bold text-xs uppercase">
                                                                        {item.name.charAt(0)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="font-medium text-neutral-800 dark:text-neutral-200">{item.name}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3 text-center">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <button type="button" onClick={() => updateQty(idx, item.qty - 1)} className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">−</button>
                                                            <span className="w-8 font-semibold text-neutral-800 dark:text-neutral-200">{item.qty}</span>
                                                            <button type="button" onClick={() => updateQty(idx, item.qty + 1)} className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">+</button>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3 text-right font-medium">
                                                        <Input
                                                            type="number"
                                                            value={item.price}
                                                            onChange={e => updatePrice(idx, Number(e.target.value))}
                                                            className="h-8 w-24 text-right text-xs"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-3 text-right font-bold text-neutral-900 dark:text-neutral-100">{formatCurrency(item.price * item.qty)}</td>
                                                    <td className="px-3 py-3 text-center">
                                                        <button type="button" onClick={() => removeItem(idx)} className="p-1.5 text-red-400 hover:text-red-600">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile List View */}
                                <div className="lg:hidden divide-y divide-neutral-100 dark:divide-neutral-800">
                                    {data.items.map((item, idx: number) => (
                                        <div key={idx} className="p-4 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex-shrink-0 overflow-hidden border border-neutral-200 dark:border-neutral-800">
                                                        {item.imageUrl ? (
                                                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-neutral-400 font-bold text-sm uppercase">
                                                                {item.name.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-neutral-900 dark:text-neutral-100">{item.name}</p>
                                                        <p className="text-xs text-neutral-500 font-mono">Item #{idx + 1}</p>
                                                    </div>
                                                </div>
                                                <button type="button" onClick={() => removeItem(idx)} className="p-2 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Quantity</label>
                                                    <div className="flex items-center gap-3 bg-neutral-50 dark:bg-neutral-800/50 p-1.5 rounded-xl w-fit">
                                                        <button type="button" onClick={() => updateQty(idx, item.qty - 1)} className="w-12 h-12 rounded-lg bg-white dark:bg-neutral-800 shadow-sm border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 flex items-center justify-center">−</button>
                                                        <span className="w-8 text-center font-bold text-neutral-900 dark:text-neutral-100">{item.qty}</span>
                                                        <button type="button" onClick={() => updateQty(idx, item.qty + 1)} className="w-12 h-12 rounded-lg bg-white dark:bg-neutral-800 shadow-sm border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 flex items-center justify-center">+</button>
                                                    </div>
                                                </div>
                                                <div className="space-y-1 text-right">
                                                    <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Unit Price</label>
                                                    <Input
                                                        type="number"
                                                        value={item.price}
                                                        onChange={e => updatePrice(idx, Number(e.target.value))}
                                                        className="h-12 text-right font-bold text-blue-600 bg-transparent"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center pt-2 border-t border-neutral-50 dark:border-neutral-800/50">
                                                <span className="text-sm font-medium text-neutral-500">Subtotal</span>
                                                <span className="text-lg font-black text-neutral-900 dark:text-neutral-100">{formatCurrency(item.price * item.qty)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {isCorporate}
                <div className="space-y-4">
{(!isCorporate || (data.create_new_client && data.new_client_type === 'Consumer')) && (                        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-3">
                            <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-2"><Package className="w-4 h-4" /> Outlet</h3>
                            <select
                                value={data.outlet_id}
                                onChange={e => {
                                    const newOutletId = e.target.value;
                                    setData('outlet_id', newOutletId);

                                    // Optionally update prices of existing items when outlet changes
                                    const updatedItems = data.items.map((item: InvoiceItem) => {
                                        const product = products.find(p => p.id === item.productId);
                                        if (product) {
                                            const outletPrice = product.outlet_prices?.find(op => op.outlet_id === Number(newOutletId))?.price;
                                            return { ...item, price: outletPrice !== undefined ? Number(outletPrice) : Number(product.price) };
                                        }
                                        return item;
                                    });
                                    const newTotal = updatedItems.reduce((s: number, i: InvoiceItem) => s + i.price * i.qty, 0);
                                    setData(d => ({
                                        ...d,
                                        outlet_id: newOutletId,
                                        items: updatedItems,
                                        total: newTotal,
                                        due: newTotal - (Number(d.paid) || 0)
                                    }));
                                }}
                                className="w-full border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 h-12 md:h-10 text-sm bg-transparent dark:text-neutral-100"
                                required
                            >
                                <option value="" disabled>Select Outlet</option>
                                {outlets.map(o => (
                                    <option key={o.id} value={o.id}>{o.name}</option>
                                ))}
                            </select>
                            {errors.outlet_id && <p className="text-xs text-red-500">{errors.outlet_id}</p>}
                        </div>
                    )}



                    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-3">
                        <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-2"><Calendar className="w-4 h-4" /> Order Details</h3>
                        <input
                            type="date"
                            value={data.date}
                            onChange={e => setData('date', e.target.value)}
                            className="w-full border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 h-12 md:h-10 text-sm bg-transparent dark:text-neutral-100"
                            placeholder="Select Date"
                            required
                        />
                        <select
                            value={data.status}
                            onChange={e => setData('status', e.target.value)}
                            className="w-full border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 h-12 md:h-10 text-sm bg-transparent dark:text-neutral-100"
                        >
                            <option value="Processing">Processing</option>
                            <option value="In House">In House</option>
                            <option value="Delivered">Delivered</option>
                        </select>
                    </div>

                    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-3">
                        <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-2"><CreditCard className="w-4 h-4" /> Discount & Payment</h3>
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                {['Fixed', 'Percentage'].map(t => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => handleDiscountTypeChange(t)}
                                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${data.discount_type === t ? 'bg-amber-50 border-amber-300 text-amber-600' : 'border-neutral-200 dark:border-neutral-800 text-neutral-500'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                            <Input
                                type="number"
                                placeholder="Discount Amount"
                                value={data.discount_amount}
                                onChange={e => handleDiscountAmountChange(e.target.value)}
                                className="h-12 md:h-9 text-sm md:text-xs"
                            />
                        </div>

                        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-1">
                            <Label htmlFor="delivery_charge" className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">Delivery Charge</Label>
                            <Input
                                id="delivery_charge"
                                type="number"
                                placeholder="Delivery Charge"
                                value={data.delivery_charge}
                                onChange={e => handleDeliveryChargeChange(e.target.value)}
                                className="h-12 md:h-9 text-sm md:text-xs"
                            />
                        </div>

                        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                            <div className="flex gap-2 mb-3">
                                {['Cash', 'Bkash', 'Bank'].map(m => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => setData('method', m)}
                                        className={`flex-1 py-2 rounded-xl text-xs font-semibold border ${data.method === m ? 'bg-blue-50 border-blue-300 text-blue-600' : 'border-neutral-200 dark:border-neutral-800 text-neutral-500'}`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                            <Input
                                type="number"
                                placeholder="Paid Amount"
                                value={data.paid}
                                onChange={e => handlePaidChange(e.target.value)}
                                className="h-12 md:h-9 text-sm md:text-xs"
                            />
                        </div>
                    </div>

                    <div className="bg-neutral-900 dark:bg-neutral-100 rounded-2xl p-5 text-white dark:text-neutral-900">
                        <h3 className="text-sm font-semibold text-neutral-400 dark:text-neutral-600 mb-4">Invoice Summary</h3>
                        {(() => {
                            const currentSubtotal = data.items.reduce((s, i) => s + i.price * i.qty, 0);
                            const currentDisc = Number(data.discount_amount) || 0;
                            const calculatedDiscountAmount = data.discount_type === 'Percentage' ? (currentSubtotal * currentDisc) / 100 : currentDisc;
                            return (
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(currentSubtotal)}</span></div>
                                    <div className="flex justify-between text-amber-400">
                                        <span>Discount {data.discount_type === 'Percentage' && data.discount_amount ? `(${data.discount_amount}%)` : ''}</span>
                                        <span>-{formatCurrency(calculatedDiscountAmount)}</span>
                                    </div>
                                    <div className="flex justify-between text-blue-400">
                                        <span>Delivery Charge</span>
                                        <span>{formatCurrency(Number(data.delivery_charge) || 0)}</span>
                                    </div>
                                    <div className="flex justify-between text-emerald-400"><span>Paid</span><span>{formatCurrency(Number(data.paid) || 0)}</span></div>
                                    <div className="flex justify-between text-red-400"><span>Due</span><span>{formatCurrency(data.due)}</span></div>
                                    <div className="border-t border-white/10 dark:border-neutral-200 pt-2 mt-2 flex justify-between text-lg font-bold">
                                        <span>Total</span><span className="text-blue-400 dark:text-blue-600">{formatCurrency(data.total)}</span>
                                    </div>
                                </div>
                            );
                        })()}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full mt-4 bg-blue-600 text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/25 disabled:opacity-50"
                        >
                            <Printer className="w-4 h-4 inline mr-2" /> {processing ? 'Saving...' : (isEdit ? 'Update Invoice' : 'Save & Print')}
                        </button>
                    </div>
                </div>
                </div>
            </form>
        </>
    );
}
