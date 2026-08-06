import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Category, Product, Client } from '@/types';
import InvoiceForm from '@/components/invoice-form';

interface CreateInvoiceProps {
    products: Product[];
    clients: Client[];
    categories: Category[];
    invoice?: any;
    next_invoice_uuid?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Create Invoice',
        href: '/invoices/create',
    },
];

export default function CreateInvoice({ products, clients, categories, invoice, next_invoice_uuid }: CreateInvoiceProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Invoice" />
            <InvoiceForm
                products={products}
                clients={clients}
                categories={categories}
                invoice={invoice}
                next_invoice_uuid={next_invoice_uuid}
            />
        </AppLayout>
    );
}
