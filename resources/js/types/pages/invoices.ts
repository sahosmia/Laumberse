import type { ClientType, DiscountType, InvoiceStatus, PaymentStatus } from '@/constants/status';
import type { Account, Category, Client, Invoice, Product } from '@/types';
import type { Paginated } from '@/types/pagination';

export interface InvoiceHistoryProps {
    invoices: Paginated<Invoice>;
    accounts: Pick<Account, 'id' | 'name' | 'account_number' | 'outlet_id'>[];
    filters: {
        search?: string;
        payment_status?: PaymentStatus | '';
        date_filter?: string;
        start_date?: string;
        end_date?: string;
        specific_date?: string;
        sort?: string;
        per_page?: number;
    };
}

export interface InvoiceLineItem {
    id: number;
    product: {
        name: string;
        image_url?: string | null;
    };
    qty: number;
    price: number;
}

/** Display-only shape used by the invoice detail/print views (a subset of the full Invoice model). */
export interface InvoiceDetail {
    id: string;
    invoice_uuid: string;
    date: string;
    outlet?: { name: string } | null;
    client: { name: string; phone: string; address: string | null; type: ClientType };
    total: number;
    paid: number;
    status: InvoiceStatus;
    payment_status: PaymentStatus;
    payment_date: string | null;
    method: string;
    remarks: string | null;
    internal_note?: string | null;
    discount_type: DiscountType;
    discount_amount: number;
    delivery_charge?: number | string | null;
    items: InvoiceLineItem[];
}

export interface InvoiceFieldChange {
    field: string;
    label: string;
    old: string | number | null;
    new: string | number | null;
}

export interface InvoiceHistoryEntry {
    id: number;
    action: 'created' | 'updated' | 'status_changed' | 'payment_status_changed' | 'cancelled';
    changes: { fields: InvoiceFieldChange[]; items: string[] } | null;
    user: { id: number; name: string } | null;
    created_at: string;
}

/** Resolved server-side per the invoice's own outlet — see App\Support\BusinessInfo. */
export interface BusinessDetails {
    name: string;
    address: string | null;
    phone: string | null;
    logo_url?: string | null;
}

export interface InvoiceDetailProps {
    invoice: InvoiceDetail;
    accounts: Pick<Account, 'id' | 'name' | 'account_number'>[];
    histories: InvoiceHistoryEntry[];
    business: BusinessDetails;
}

export interface PosPrintProps {
    invoice: InvoiceDetail;
    business: BusinessDetails;
}

export interface EditInvoiceProps {
    invoice: Invoice;
    products: Product[];
    clients: Client[];
    categories: Category[];
    accounts: Pick<Account, 'id' | 'name' | 'account_number' | 'outlet_id'>[];
}

export interface CreateInvoiceProps {
    invoice?: Invoice;
    products: Product[];
    clients: Client[];
    categories: Category[];
    accounts: Pick<Account, 'id' | 'name' | 'account_number' | 'outlet_id'>[];
}
