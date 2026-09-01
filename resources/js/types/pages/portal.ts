import type { CustomPrice } from '@/types/pages/clients';
import type { ClientActivity, Invoice, InvoiceItem } from '@/types';
import type { Paginated } from '@/types/pagination';

export interface PortalInvoicesProps {
    invoices: Paginated<Invoice>;
}

export interface PortalInvoiceShowProps {
    invoice: Invoice & { items: InvoiceItem[] };
}

export interface PortalPricesProps {
    prices: Paginated<CustomPrice>;
}

export interface PortalActivitiesProps {
    activities: Paginated<ClientActivity>;
}
