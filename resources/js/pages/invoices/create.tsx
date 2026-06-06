import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Category, Product, Client, Outlet } from '@/types';
import InvoiceForm from '@/components/invoice-form';

interface CreateInvoiceProps {
    products: Product[];
    clients: Client[];
    categories: Category[];
    outlets: Outlet[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Create Invoice',
        href: '/invoices/create',
    },
];

export default function CreateInvoice({ products, clients, categories, outlets, invoice }: CreateInvoiceProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Invoice" />
            <InvoiceForm
                products={products}
                clients={clients}
                categories={categories}
                outlets={outlets}
                invoice={invoice}
            />
        </AppLayout>
    );
}
