import type { Client, Invoice, InvoiceItem, Product } from '@/types';
import type { Paginated } from '@/types/pagination';

export interface ClientsProps {
    clients: Paginated<Client>;
    products: Product[];
    filters: { search?: string };
}

export interface CustomPrice {
    id: number;
    customer_id: number;
    product_id: number;
    custom_price: number;
    product?: {
        name: string;
    };
}

export interface ClientShowProps {
    client: Client & {
        invoices: (Invoice & { items: InvoiceItem[] })[];
        custom_prices: CustomPrice[];
    };
}
