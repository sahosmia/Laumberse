import type { Client, ClientActivity, Employee, Invoice, InvoiceItem, Outlet, Product } from '@/types';
import type { Paginated } from '@/types/pagination';

export interface ClientsProps {
    clients: Paginated<Client>;
    products: Product[];
    /** Every active outlet — any staff member may set any outlet on a client, not just their own. */
    outlets: Pick<Outlet, 'id' | 'name'>[];
    filters: { search?: string; type?: string; outlet_id?: number | string; sort?: string; per_page?: number };
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

export interface ClientDateFilters {
    search?: string;
    per_page?: number;
    date_filter?: string;
    start_date?: string;
    end_date?: string;
    specific_date?: string;
}

export interface ClientShowProps {
    client: Client & {
        custom_prices: CustomPrice[];
    };
    orders: Paginated<Invoice & { items: InvoiceItem[] }>;
    activities: Paginated<ClientActivity>;
    employees: Pick<Employee, 'id' | 'name'>[];
    orderFilters: ClientDateFilters;
    activityFilters: ClientDateFilters;
}
