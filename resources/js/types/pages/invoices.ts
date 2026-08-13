import type { ClientType, DiscountType, InvoiceStatus, PaymentStatus } from '@/constants/status';
import type { Category, Client, Invoice, Product } from '@/types';
import type { Paginated } from '@/types/pagination';

export interface InvoiceHistoryProps {
    invoices: Paginated<Invoice>;
    filters: {
        search?: string;
        payment_status?: PaymentStatus | '';
        date_filter?: string;
        start_date?: string;
        end_date?: string;
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
    date: string;
    client: { name: string; phone: string; address: string | null; type: ClientType };
    total: number;
    paid: number;
    status: InvoiceStatus;
    payment_status: PaymentStatus;
    payment_date: string | null;
    method: string;
    remarks: string | null;
    discount_type: DiscountType;
    discount_amount: number;
    delivery_charge?: number | string | null;
    items: InvoiceLineItem[];
}

export interface InvoiceDetailProps {
    invoice: InvoiceDetail;
}

export interface PrintProps {
    invoice: InvoiceDetail;
}

export interface EditInvoiceProps {
    invoice: Invoice;
    products: Product[];
    clients: Client[];
    categories: Category[];
}

export interface CreateInvoiceProps {
    products: Product[];
    clients: Client[];
    categories: Category[];
}
