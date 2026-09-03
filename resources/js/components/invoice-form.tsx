import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';
import { SaveConfirmationModal } from '@/components/save-confirmation-modal';
import { Checkbox } from '@/components/ui/checkbox';
import { FormSelect } from '@/components/ui/form-select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RequiredMark } from '@/components/ui/required-mark';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { CLIENT_TYPES, DISCOUNT_TYPES, INVOICE_FORM_STATUSES, type ClientType, type DiscountType, type InvoiceStatus } from '@/constants/status';
import { formatCurrency } from '@/lib/format';
import { Account, Category, Client, Invoice as InvoiceRecord, Product, SharedData } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import { Calendar, CreditCard, Package, Printer, Search, Trash2, UserPlus, Users } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

/** The form's own working shape for a line item, distinct from the API's `InvoiceItem` (`@/types`). */
export interface InvoiceItem {
    productId: number;
    name: string;
    price: number | '';
    qty: number | '';
    imageUrl?: string | null;
}

interface InvoiceFormProps {
    invoice?: InvoiceRecord;
    products: Product[];
    clients: Client[];
    categories: Category[];
    accounts: Pick<Account, 'id' | 'name' | 'account_number'>[];
    isEdit?: boolean;
}

interface InvoiceTotalsInput {
    items: InvoiceItem[];
    paid: number | string;
    discountType: DiscountType;
    discountAmount: number | string;
    deliveryCharge: number | string;
    isCorporate: boolean;
}

function computeInvoiceTotals({ items, paid, discountType, discountAmount, deliveryCharge, isCorporate }: InvoiceTotalsInput) {
    const subtotal = items.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.qty) || 0), 0);
    const disc = Number(discountAmount) || 0;
    const discountValue = discountType === 'Percentage' ? (subtotal * disc) / 100 : disc;
    const deliv = isCorporate ? 0 : Number(deliveryCharge) || 0;
    const total = Math.max(0, subtotal - discountValue) + deliv;
    const due = total - (Number(paid) || 0);
    return { subtotal, discountValue, total, due };
}

export default function InvoiceForm({ invoice, products, clients, accounts, isEdit = false }: InvoiceFormProps) {
    const { outlet } = usePage<SharedData>().props;
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedCategory] = useState('All');
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const [itemIndexToDelete, setItemIndexToDelete] = useState<number | null>(null);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const productOptionRefs = useRef<(HTMLButtonElement | null)[]>([]);

    // Briefly flags whichever product line was just added/incremented so its row can flash a
    // highlight — the newest row already animates in via slide/fade on mount, but that alone
    // doesn't help when the "add" just bumped an *existing* row's quantity instead of creating a
    // new DOM node, so nothing would otherwise visibly change.
    const [justAddedProductId, setJustAddedProductId] = useState<number | null>(null);
    const justAddedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const flashJustAdded = (productId: number) => {
        if (justAddedTimeoutRef.current) clearTimeout(justAddedTimeoutRef.current);
        setJustAddedProductId(productId);
        justAddedTimeoutRef.current = setTimeout(() => setJustAddedProductId(null), 1200);
    };

    const { data, setData, post, put, processing, errors } = useForm({
        date: invoice?.date || new Date().toISOString().split('T')[0],
        outlet_id: '' as number | '',
        client_id: invoice?.client_id || (null as string | number | null),
        create_new_client: false,
        new_client_name: '',
        new_client_phone: '',
        new_client_type: 'Consumer' as ClientType,
        new_client_address: '',
        total: invoice?.total || 0,
        paid: invoice?.paid ? invoice.paid : ('' as string | number),
        due: invoice?.due || 0,
        status: invoice?.status || ('In House' as InvoiceStatus),
        account_id: invoice?.account_id || ('' as string | number),
        remarks: invoice?.remarks || '',
        internal_note: invoice?.internal_note || '',
        discount_type: invoice?.discount_type || ('Fixed' as DiscountType),
        discount_amount: invoice?.discount_amount ? invoice.discount_amount : ('' as string | number),
        delivery_charge: invoice?.delivery_charge ? invoice.delivery_charge : ('' as string | number),
        items:
            invoice?.items?.map((item) => ({
                productId: item.product_id,
                name: item.product?.name || 'Unknown Product',
                price: Number(item.price),
                qty: item.qty,
                imageUrl: item.product?.image_url || null,
            })) || ([] as InvoiceItem[]),
    });

    const filtered = useMemo(() => {
        return products.filter((p) => {
            const matchCat = selectedCategory === 'All' || p.category?.name === selectedCategory;
            const matchSearch = searchTerm.length === 0 || p.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchCat && matchSearch;
        });
    }, [searchTerm, selectedCategory, products]);

    const visibleProducts = filtered.slice(0, 20);

    const selectedClient = clients.find((c) => c.id == data.client_id);
    const isCorporate = data.create_new_client ? data.new_client_type === 'Corporate' : selectedClient?.type === 'Corporate';

    // Precedence: client custom price (Corporate only) > this outlet's price override > the
    // product's plain default price. `client`/`isCreatingNewClient` default to the currently
    // selected client, but the client-switch handler below needs to resolve prices against the
    // *newly* picked client before that becomes `selectedClient` on the next render.
    const resolveProductPrice = (
        product: Product,
        client: Client | undefined = selectedClient,
        isCreatingNewClient: boolean = data.create_new_client,
    ): number => {
        let price = Number(product.price);

        const outletPrice = product.outlet_prices?.find((op) => op.outlet_id === outlet?.current?.id)?.price;
        if (outletPrice !== undefined) {
            price = Number(outletPrice);
        }

        if (!isCreatingNewClient && client?.type === 'Corporate') {
            const customPrice = client.custom_prices?.find((cp) => cp.product_id === product.id)?.custom_price;
            if (customPrice !== undefined) {
                price = Number(customPrice);
            }
        }

        return price;
    };

    const handleDeliveryChargeChange = (val: string) => {
        const { total, due } = computeInvoiceTotals({
            items: data.items,
            paid: data.paid,
            discountType: data.discount_type,
            discountAmount: data.discount_amount,
            deliveryCharge: val,
            isCorporate,
        });
        setData((d) => ({
            ...d,
            delivery_charge: val,
            total,
            due,
        }));
    };

    const addItem = (product: Product) => {
        const existingIdx = data.items.findIndex((i) => i.productId === product.id);
        const newItems = [...data.items];

        const price = resolveProductPrice(product);

        if (existingIdx > -1) {
            newItems[existingIdx].qty = Number(newItems[existingIdx].qty) + 1;
            newItems[existingIdx].price = price;
        } else {
            newItems.push({
                productId: product.id,
                name: product.name,
                price: price,
                qty: 1,
                imageUrl: product.image_url,
            });
        }

        const { total, due } = computeInvoiceTotals({
            items: newItems,
            paid: data.paid,
            discountType: data.discount_type,
            discountAmount: data.discount_amount,
            deliveryCharge: data.delivery_charge,
            isCorporate,
        });
        setData((d) => ({
            ...d,
            items: newItems,
            total,
            due,
        }));
        flashJustAdded(product.id);

        setSearchTerm('');
        setShowDropdown(false);
        setHighlightedIndex(0);
    };

    const handleProductSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showDropdown || visibleProducts.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex((i) => {
                const next = Math.min(i + 1, visibleProducts.length - 1);
                productOptionRefs.current[next]?.scrollIntoView({ block: 'nearest' });
                return next;
            });
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex((i) => {
                const next = Math.max(i - 1, 0);
                productOptionRefs.current[next]?.scrollIntoView({ block: 'nearest' });
                return next;
            });
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const product = visibleProducts[highlightedIndex];
            if (product) addItem(product);
        } else if (e.key === 'Escape') {
            setShowDropdown(false);
        }
    };

    const updateQty = (idx: number, newQty: number | string) => {
        if (newQty !== '' && Number(newQty) < 1) return;
        const newItems = [...data.items];
        newItems[idx].qty = newQty === '' ? '' : Number(newQty);

        const { total, due } = computeInvoiceTotals({
            items: newItems,
            paid: data.paid,
            discountType: data.discount_type,
            discountAmount: data.discount_amount,
            deliveryCharge: data.delivery_charge,
            isCorporate,
        });
        setData((d) => ({
            ...d,
            items: newItems,
            total,
            due,
        }));
    };

    const updatePrice = (idx: number, newPrice: number | '') => {
        const newItems = [...data.items];
        newItems[idx].price = newPrice;

        const { total, due } = computeInvoiceTotals({
            items: newItems,
            paid: data.paid,
            discountType: data.discount_type,
            discountAmount: data.discount_amount,
            deliveryCharge: data.delivery_charge,
            isCorporate,
        });
        setData((d) => ({
            ...d,
            items: newItems,
            total,
            due,
        }));
    };

    const removeItem = (idx: number) => {
        const newItems = data.items.filter((_, i) => i !== idx);
        const { total, due } = computeInvoiceTotals({
            items: newItems,
            paid: data.paid,
            discountType: data.discount_type,
            discountAmount: data.discount_amount,
            deliveryCharge: data.delivery_charge,
            isCorporate,
        });
        setData((d) => ({
            ...d,
            items: newItems,
            total,
            due,
        }));
    };

    const handleRemoveClick = (idx: number) => {
        setItemIndexToDelete(idx);
        setIsConfirmingDelete(true);
    };

    const handlePaidChange = (val: string) => {
        const { total } = computeInvoiceTotals({
            items: data.items,
            paid: val,
            discountType: data.discount_type,
            discountAmount: data.discount_amount,
            deliveryCharge: data.delivery_charge,
            isCorporate,
        });
        setData((d) => ({
            ...d,
            paid: val,
            due: total - (Number(val) || 0),
        }));
    };

    const handleDiscountTypeChange = (type: DiscountType) => {
        const { total, due } = computeInvoiceTotals({
            items: data.items,
            paid: data.paid,
            discountType: type,
            discountAmount: data.discount_amount,
            deliveryCharge: data.delivery_charge,
            isCorporate,
        });
        setData((d) => ({
            ...d,
            discount_type: type,
            total,
            due,
        }));
    };

    const handleDiscountAmountChange = (val: string) => {
        const { total, due } = computeInvoiceTotals({
            items: data.items,
            paid: data.paid,
            discountType: data.discount_type,
            discountAmount: val,
            deliveryCharge: data.delivery_charge,
            isCorporate,
        });
        setData((d) => ({
            ...d,
            discount_amount: val,
            total,
            due,
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

    const totals = useMemo(
        () =>
            computeInvoiceTotals({
                items: data.items,
                paid: data.paid,
                discountType: data.discount_type,
                discountAmount: data.discount_amount,
                deliveryCharge: data.delivery_charge,
                isCorporate,
            }),
        [data.items, data.paid, data.discount_type, data.discount_amount, data.delivery_charge, isCorporate],
    );

    const clientOptions = clients.map((c) => ({ label: `${c.name} (${c.phone})`, value: c.id }));

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
            <DeleteConfirmationModal
                isOpen={isConfirmingDelete}
                onClose={() => {
                    setIsConfirmingDelete(false);
                    setItemIndexToDelete(null);
                }}
                onConfirm={() => {
                    if (itemIndexToDelete !== null) {
                        removeItem(itemIndexToDelete);
                    }
                    setIsConfirmingDelete(false);
                    setItemIndexToDelete(null);
                }}
                title="Remove Product"
                description="Are you sure you want to remove this product from the invoice?"
                confirmText="Remove"
            />
            <form onSubmit={handleSubmit} className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{isEdit ? 'Edit Invoice' : 'Create Invoice'}</h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">POS — quick service entry</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-neutral-400">Invoice No.</p>
                        <p className="flex h-8 items-center justify-end font-mono text-sm font-bold text-neutral-700 dark:text-neutral-300">
                            {invoice?.invoice_uuid || 'Auto-generated on save'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="space-y-4 lg:col-span-2">
                        <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                            <div className="flex items-center justify-between">
                                <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                    <Users className="h-4 w-4" /> Client
                                </h3>
                                {!isEdit && (
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="create_new_client"
                                            checked={data.create_new_client}
                                            onCheckedChange={(checked) => {
                                                const isNew = !!checked;
                                                const { total, due } = computeInvoiceTotals({
                                                    items: [],
                                                    paid: data.paid,
                                                    discountType: data.discount_type,
                                                    discountAmount: data.discount_amount,
                                                    deliveryCharge: isNew ? '' : data.delivery_charge,
                                                    isCorporate: isNew ? data.new_client_type === 'Corporate' : false,
                                                });
                                                setData((d) => ({
                                                    ...d,
                                                    create_new_client: isNew,
                                                    client_id: null,
                                                    items: [],
                                                    delivery_charge: isNew ? '' : d.delivery_charge,
                                                    total,
                                                    due,
                                                }));
                                            }}
                                        />
                                        <Label htmlFor="create_new_client" className="cursor-pointer text-xs font-medium">
                                            New Client
                                        </Label>
                                    </div>
                                )}
                            </div>

                            {!data.create_new_client ? (
                                <div>
                                    <SearchableSelect
                                        options={clientOptions}
                                        value={data.client_id}
                                        onChange={(val) => {
                                            const newClient = clients.find((c) => c.id == val);
                                            const newIsCorporate = newClient?.type === 'Corporate';
                                            const newDeliveryCharge = newIsCorporate ? '' : data.delivery_charge;

                                            let newItems: InvoiceItem[];
                                            if (newIsCorporate && data.items.length === 0) {
                                                // Convenience for a fresh, empty invoice: pre-fill with the corporate
                                                // client's full custom price list instead of leaving it empty.
                                                newItems = (newClient?.custom_prices || [])
                                                    .map((cp) => {
                                                        const product = products.find((p) => p.id === cp.product_id);
                                                        if (!product) return null;
                                                        return {
                                                            productId: product.id,
                                                            name: product.name,
                                                            price: Number(cp.custom_price),
                                                            qty: 1,
                                                            imageUrl: product.image_url,
                                                        };
                                                    })
                                                    .filter(Boolean) as InvoiceItem[];
                                            } else {
                                                // Keep whatever's already selected (or already on the invoice, when
                                                // editing) — just re-price each line for the new client instead of
                                                // discarding the selection.
                                                newItems = data.items.map((item) => {
                                                    const product = products.find((p) => p.id === item.productId);
                                                    return product ? { ...item, price: resolveProductPrice(product, newClient, false) } : item;
                                                });
                                            }

                                            const { total, due } = computeInvoiceTotals({
                                                items: newItems,
                                                paid: data.paid,
                                                discountType: data.discount_type,
                                                discountAmount: data.discount_amount,
                                                deliveryCharge: newDeliveryCharge,
                                                isCorporate: newIsCorporate,
                                            });
                                            setData((d) => ({
                                                ...d,
                                                client_id: val,
                                                items: newItems,
                                                delivery_charge: newDeliveryCharge,
                                                total,
                                                due,
                                            }));
                                        }}
                                        placeholder="Select Client"
                                        error={errors.client_id}
                                    />
                                </div>
                            ) : (
                                <div className="space-y-3 rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50 p-3 dark:border-neutral-800 dark:bg-neutral-800/20">
                                    <div className="mb-1 flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                                        <UserPlus className="h-3 w-3" /> Inline Client Creation
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="new_client_name" className="text-[10px] tracking-wider text-neutral-500 uppercase">
                                            Name <RequiredMark />
                                        </Label>
                                        <Input
                                            id="new_client_name"
                                            value={data.new_client_name}
                                            onChange={(e) => setData('new_client_name', e.target.value)}
                                            placeholder="Client Name"
                                            className="h-12 text-sm md:h-9 md:text-xs"
                                        />
                                        {errors.new_client_name && <p className="text-[10px] text-red-500">{errors.new_client_name}</p>}
                                    </div>
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="new_client_phone" className="text-[10px] tracking-wider text-neutral-500 uppercase">
                                                Phone <RequiredMark />
                                            </Label>
                                            <Input
                                                id="new_client_phone"
                                                value={data.new_client_phone}
                                                onChange={(e) => setData('new_client_phone', e.target.value)}
                                                placeholder="Phone Number"
                                                className="h-12 text-sm md:h-9 md:text-xs"
                                            />
                                            {errors.new_client_phone && <p className="text-[10px] text-red-500">{errors.new_client_phone}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="new_client_type" className="text-[10px] tracking-wider text-neutral-500 uppercase">
                                                Type
                                            </Label>
                                            <FormSelect
                                                id="new_client_type"
                                                value={data.new_client_type}
                                                onChange={(e) => {
                                                    const newType = e.target.value as ClientType;
                                                    const newIsCorporate = newType === 'Corporate';
                                                    const newDeliveryCharge = newIsCorporate ? '' : data.delivery_charge;
                                                    const { total, due } = computeInvoiceTotals({
                                                        items: data.items,
                                                        paid: data.paid,
                                                        discountType: data.discount_type,
                                                        discountAmount: data.discount_amount,
                                                        deliveryCharge: newDeliveryCharge,
                                                        isCorporate: newIsCorporate,
                                                    });
                                                    setData((d) => ({
                                                        ...d,
                                                        new_client_type: newType,
                                                        delivery_charge: newDeliveryCharge,
                                                        total,
                                                        due,
                                                    }));
                                                }}
                                                className="md:h-9 md:text-xs"
                                            >
                                                {CLIENT_TYPES.map((t) => (
                                                    <option key={t} value={t}>
                                                        {t}
                                                    </option>
                                                ))}
                                            </FormSelect>
                                            {errors.new_client_type && <p className="text-[10px] text-red-500">{errors.new_client_type}</p>}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="new_client_address" className="text-[10px] tracking-wider text-neutral-500 uppercase">
                                            Address (Optional)
                                        </Label>
                                        <Input
                                            id="new_client_address"
                                            value={data.new_client_address}
                                            onChange={(e) => setData('new_client_address', e.target.value)}
                                            placeholder="Address"
                                            className="h-12 text-sm md:h-9 md:text-xs"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
                            <div className="border-b border-neutral-100 p-5 dark:border-neutral-800">
                                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                    <Search className="h-4 w-4" /> Add Product
                                </h3>
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                    <input
                                        type="text"
                                        placeholder="Search product..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setShowDropdown(true);
                                            setHighlightedIndex(0);
                                        }}
                                        onFocus={() => setShowDropdown(true)}
                                        onKeyDown={handleProductSearchKeyDown}
                                        className="h-12 w-full rounded-xl border border-neutral-200 bg-transparent pr-4 pl-10 text-sm transition-all focus:ring-2 focus:ring-blue-500/30 focus:outline-none md:h-10 dark:border-neutral-800"
                                    />
                                    {showDropdown && (searchTerm.length > 0 || selectedCategory !== 'All') && (
                                        <div className="absolute top-full right-0 left-0 z-30 mt-1 max-h-72 overflow-y-auto rounded-xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
                                            {visibleProducts.length === 0 ? (
                                                <div className="p-4 text-center text-sm text-neutral-400">No products found</div>
                                            ) : (
                                                visibleProducts.map((p, idx) => (
                                                    <button
                                                        key={p.id}
                                                        ref={(el) => {
                                                            productOptionRefs.current[idx] = el;
                                                        }}
                                                        type="button"
                                                        onClick={() => addItem(p)}
                                                        onMouseEnter={() => setHighlightedIndex(idx)}
                                                        className={`flex w-full items-center justify-between border-b border-neutral-50 px-4 py-2.5 text-left transition-colors last:border-0 dark:border-neutral-800 ${idx === highlightedIndex ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                                    >
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
                                                            <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                                                                {p.name}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-bold text-blue-600">
                                                                {formatCurrency(resolveProductPrice(p))}
                                                            </span>
                                                        </div>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3 dark:border-neutral-800">
                                <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Invoice Items ({data.items.length})</h3>
                                {errors.items && <p className="text-xs text-red-500">{errors.items}</p>}
                            </div>
                            {data.items.length === 0 ? (
                                <div className="p-10 text-center">
                                    <Package className="mx-auto mb-2 h-10 w-10 text-neutral-200 dark:text-neutral-800" />
                                    <p className="text-sm text-neutral-400">No items added yet.</p>
                                </div>
                            ) : (
                                <>
                                    {/* Desktop Table View — most recently added item first */}
                                    <div className="hidden overflow-x-auto lg:block">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-neutral-50 text-xs tracking-wider text-neutral-500 uppercase dark:bg-neutral-800/50">
                                                    <th className="px-5 py-2.5 text-left font-semibold">#</th>
                                                    <th className="px-3 py-2.5 text-left font-semibold">Service</th>
                                                    <th className="w-24 px-3 py-2.5 text-center font-semibold">Qty</th>
                                                    <th className="w-28 px-3 py-2.5 text-right font-semibold">Price</th>
                                                    <th className="w-28 px-3 py-2.5 text-right font-semibold">Total</th>
                                                    <th className="w-12 px-3 py-2.5 text-center font-semibold"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data.items
                                                    .map((item, idx) => ({ item, idx }))
                                                    .slice()
                                                    .reverse()
                                                    .map(({ item, idx }) => (
                                                        <tr
                                                            key={idx}
                                                            className={`animate-in fade-in slide-in-from-top-2 border-b-2 border-neutral-200 transition-colors duration-500 last:border-b-0 hover:bg-neutral-50/50 dark:border-neutral-700 dark:hover:bg-neutral-800/30 ${
                                                                item.productId === justAddedProductId ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''
                                                            }`}
                                                        >
                                                            <td className="px-5 py-3 font-mono text-xs text-neutral-400">{idx + 1}</td>
                                                            <td className="px-3 py-3">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800">
                                                                        {item.imageUrl ? (
                                                                            <img
                                                                                src={item.imageUrl}
                                                                                alt={item.name}
                                                                                className="h-full w-full object-cover"
                                                                            />
                                                                        ) : (
                                                                            <div className="flex h-full w-full items-center justify-center text-xs font-bold text-neutral-400 uppercase">
                                                                                {item.name.charAt(0)}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="font-medium text-neutral-800 dark:text-neutral-200">
                                                                        {item.name}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-3 py-3 text-center">
                                                                <div className="flex items-center justify-center gap-1">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => updateQty(idx, (Number(item.qty) || 0) - 1)}
                                                                        className="h-7 w-7 rounded-lg bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                                                                    >
                                                                        −
                                                                    </button>
                                                                    <Input
                                                                        type="number"
                                                                        value={item.qty}
                                                                        onChange={(e) => {
                                                                            const val = e.target.value;
                                                                            const num = val === '' ? '' : Math.max(1, parseInt(val, 10));
                                                                            updateQty(idx, num);
                                                                        }}
                                                                        className="h-8 w-12 [appearance:textfield] bg-transparent p-0 text-center font-semibold text-neutral-800 focus-visible:ring-1 dark:text-neutral-200 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => updateQty(idx, (Number(item.qty) || 0) + 1)}
                                                                        className="h-7 w-7 rounded-lg bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                                                                    >
                                                                        +
                                                                    </button>
                                                                </div>
                                                            </td>
                                                            <td className="px-3 py-3 text-right font-medium">
                                                                <Input
                                                                    type="number"
                                                                    value={item.price}
                                                                    onChange={(e) => {
                                                                        let val = e.target.value;
                                                                        if (val.length > 1 && val.startsWith('0') && val[1] !== '.') {
                                                                            val = val.replace(/^0+/, '');
                                                                        }
                                                                        updatePrice(idx, val === '' ? '' : parseFloat(val));
                                                                    }}
                                                                    className="h-8 w-24 text-right text-xs"
                                                                />
                                                            </td>
                                                            <td className="px-3 py-3 text-right font-bold text-neutral-900 dark:text-neutral-100">
                                                                {formatCurrency((Number(item.price) || 0) * Number(item.qty))}
                                                            </td>
                                                            <td className="px-3 py-3 text-center">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveClick(idx)}
                                                                    className="p-1.5 text-red-400 hover:text-red-600"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile List View — most recently added item first, each in its own bordered card */}
                                    <div className="space-y-3 p-3 lg:hidden">
                                        {data.items
                                            .map((item, idx) => ({ item, idx }))
                                            .slice()
                                            .reverse()
                                            .map(({ item, idx }) => (
                                                <div
                                                    key={idx}
                                                    className={`animate-in fade-in slide-in-from-top-2 space-y-4 rounded-xl border border-neutral-200 p-4 transition-colors duration-500 dark:border-neutral-700 ${
                                                        item.productId === justAddedProductId ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800">
                                                                {item.imageUrl ? (
                                                                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                                                                ) : (
                                                                    <div className="flex h-full w-full items-center justify-center text-sm font-bold text-neutral-400 uppercase">
                                                                        {item.name.charAt(0)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-neutral-900 dark:text-neutral-100">{item.name}</p>
                                                                <p className="font-mono text-xs text-neutral-500">Item #{idx + 1}</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveClick(idx)}
                                                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500 dark:bg-red-900/20"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                                                                Quantity
                                                            </label>
                                                            <div className="flex w-fit items-center gap-3 rounded-xl bg-neutral-50 p-1.5 dark:bg-neutral-800/50">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => updateQty(idx, (Number(item.qty) || 0) - 1)}
                                                                    className="flex h-12 w-12 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 shadow-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
                                                                >
                                                                    −
                                                                </button>
                                                                <Input
                                                                    type="number"
                                                                    value={item.qty}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value;
                                                                        const num = val === '' ? '' : Math.max(1, parseInt(val, 10));
                                                                        updateQty(idx, num);
                                                                    }}
                                                                    className="h-12 w-12 [appearance:textfield] border-none bg-transparent p-0 text-center font-bold text-neutral-900 shadow-none focus-visible:ring-0 dark:text-neutral-100 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => updateQty(idx, (Number(item.qty) || 0) + 1)}
                                                                    className="flex h-12 w-12 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 shadow-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1 text-right">
                                                            <label className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                                                                Unit Price
                                                            </label>
                                                            <Input
                                                                type="number"
                                                                value={item.price}
                                                                onChange={(e) => {
                                                                    let val = e.target.value;
                                                                    if (val.length > 1 && val.startsWith('0') && val[1] !== '.') {
                                                                        val = val.replace(/^0+/, '');
                                                                    }
                                                                    updatePrice(idx, val === '' ? '' : parseFloat(val));
                                                                }}
                                                                className="h-12 bg-transparent text-right font-bold text-blue-600"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between border-t border-neutral-50 pt-2 dark:border-neutral-800/50">
                                                        <span className="text-sm font-medium text-neutral-500">Subtotal</span>
                                                        <span className="text-lg font-black text-neutral-900 dark:text-neutral-100">
                                                            {formatCurrency((Number(item.price) || 0) * Number(item.qty))}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
                        <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                            <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                <Calendar className="h-4 w-4" /> Order Details
                            </h3>
                            <input
                                type="date"
                                value={data.date}
                                onChange={(e) => setData('date', e.target.value)}
                                className="h-12 w-full rounded-xl border border-neutral-200 bg-transparent px-3 text-sm md:h-10 dark:border-neutral-800 dark:text-neutral-100"
                                placeholder="Select Date"
                                required
                            />
                            <FormSelect value={data.status} onChange={(e) => setData('status', e.target.value as InvoiceStatus)}>
                                {INVOICE_FORM_STATUSES.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </FormSelect>
                            {!isEdit && outlet?.isAll && (
                                <FormSelect
                                    label="Outlet"
                                    required
                                    value={data.outlet_id}
                                    onChange={(e) => setData('outlet_id', e.target.value ? Number(e.target.value) : '')}
                                    className="md:h-9 md:text-xs"
                                    error={errors.outlet_id}
                                    helperText='This invoice needs a specific outlet — "All Outlets" is a view, not a place to save new records.'
                                >
                                    <option value="">Select an outlet</option>
                                    {outlet.available.map((o) => (
                                        <option key={o.id} value={o.id}>
                                            {o.name}
                                        </option>
                                    ))}
                                </FormSelect>
                            )}
                        </div>

                        <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                            <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                <CreditCard className="h-4 w-4" /> Discount & Payment
                            </h3>
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    {DISCOUNT_TYPES.map((t) => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => handleDiscountTypeChange(t)}
                                            className={`flex h-11 flex-1 items-center justify-center rounded-lg border text-[10px] font-bold tracking-wider uppercase md:h-8 ${data.discount_type === t ? 'border-amber-300 bg-amber-50 text-amber-600' : 'border-neutral-200 text-neutral-500 dark:border-neutral-800'}`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                                <Input
                                    type="number"
                                    placeholder="Discount Amount"
                                    value={data.discount_amount}
                                    onChange={(e) => handleDiscountAmountChange(e.target.value)}
                                    className="h-12 text-sm md:h-9 md:text-xs"
                                />
                            </div>

                            {!isCorporate && (
                                <div className="space-y-1 border-t border-neutral-100 pt-2 dark:border-neutral-800">
                                    <Label htmlFor="delivery_charge" className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
                                        Delivery Charge
                                    </Label>
                                    <Input
                                        id="delivery_charge"
                                        type="number"
                                        placeholder="Delivery Charge"
                                        value={data.delivery_charge}
                                        onChange={(e) => handleDeliveryChargeChange(e.target.value)}
                                        className="h-12 text-sm md:h-9 md:text-xs"
                                    />
                                </div>
                            )}

                            <div className="space-y-1 border-t border-neutral-100 pt-2 dark:border-neutral-800">
                                <Label htmlFor="account_id" className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
                                    Payment Account {Number(data.paid) > 0 && <RequiredMark />}
                                </Label>
                                <FormSelect
                                    id="account_id"
                                    value={data.account_id}
                                    onChange={(e) => setData('account_id', e.target.value === '' ? '' : Number(e.target.value))}
                                    className="md:h-9 md:text-xs"
                                    required={Number(data.paid) > 0}
                                    error={errors.account_id}
                                >
                                    <option value="">{Number(data.paid) > 0 ? 'Select Account' : 'Select Account (optional — not yet paid)'}</option>
                                    {accounts.map((a) => (
                                        <option key={a.id} value={a.id}>
                                            {a.name}
                                            {a.account_number ? ` (${a.account_number})` : ''}
                                        </option>
                                    ))}
                                </FormSelect>
                                <Input
                                    type="number"
                                    placeholder="Paid Amount"
                                    value={data.paid}
                                    onChange={(e) => handlePaidChange(e.target.value)}
                                    className="h-12 text-sm md:h-9 md:text-xs"
                                />
                            </div>

                            <div className="space-y-1 border-t border-neutral-100 pt-2 dark:border-neutral-800">
                                <Label htmlFor="remarks" className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
                                    Remarks
                                </Label>
                                <textarea
                                    id="remarks"
                                    value={data.remarks}
                                    onChange={(e) => setData('remarks', e.target.value)}
                                    className="w-full rounded-xl border border-neutral-200 bg-transparent px-3 py-2 text-xs dark:border-neutral-800 dark:text-neutral-100"
                                    rows={2}
                                    placeholder="Shown to the client on the invoice/PDF"
                                />
                                {errors.remarks && <p className="text-xs text-red-500">{errors.remarks}</p>}
                            </div>

                            <div className="space-y-1 border-t border-neutral-100 pt-2 dark:border-neutral-800">
                                <Label htmlFor="internal_note" className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
                                    Internal Note
                                </Label>
                                <textarea
                                    id="internal_note"
                                    value={data.internal_note}
                                    onChange={(e) => setData('internal_note', e.target.value)}
                                    className="w-full rounded-xl border border-neutral-200 bg-transparent px-3 py-2 text-xs dark:border-neutral-800 dark:text-neutral-100"
                                    rows={2}
                                    placeholder="Staff-only — never shown to the client"
                                />
                                {errors.internal_note && <p className="text-xs text-red-500">{errors.internal_note}</p>}
                            </div>
                        </div>

                        <div className="rounded-2xl bg-neutral-900 p-5 text-white dark:bg-neutral-100 dark:text-neutral-900">
                            <h3 className="mb-4 text-sm font-semibold text-neutral-400 dark:text-neutral-600">Invoice Summary</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(totals.subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-amber-400">
                                    <span>
                                        Discount ({data.discount_type === 'Percentage' ? `Percentage ${data.discount_amount}%` : data.discount_type})
                                    </span>
                                    <span>-{formatCurrency(totals.discountValue)}</span>
                                </div>
                                {!isCorporate && (
                                    <div className="flex justify-between text-blue-400">
                                        <span>Delivery Charge</span>
                                        <span>{formatCurrency(Number(data.delivery_charge) || 0)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-emerald-400">
                                    <span>Paid</span>
                                    <span>{formatCurrency(Number(data.paid) || 0)}</span>
                                </div>
                                <div className="flex justify-between text-red-400">
                                    <span>Due</span>
                                    <span>{formatCurrency(data.due)}</span>
                                </div>
                                <div className="mt-2 flex justify-between border-t border-white/10 pt-2 text-lg font-bold dark:border-neutral-200">
                                    <span>Total</span>
                                    <span className="text-blue-400 dark:text-blue-600">{formatCurrency(data.total)}</span>
                                </div>
                            </div>
                            {Object.keys(errors).length > 0 && (
                                <div className="mt-4 space-y-1 rounded-xl border border-red-500/30 bg-red-500/10 p-3">
                                    <p className="text-xs font-bold text-red-400">Please fix the following before saving:</p>
                                    {Object.values(errors).map((message, idx) => (
                                        <p key={idx} className="text-xs text-red-400">
                                            {message}
                                        </p>
                                    ))}
                                </div>
                            )}
                            <button
                                type="submit"
                                disabled={processing}
                                className="mt-4 w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 disabled:opacity-50"
                            >
                                <Printer className="mr-2 inline h-4 w-4" /> {processing ? 'Saving...' : isEdit ? 'Update Invoice' : 'Save & Print'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
}
