import InvoiceForm from '@/components/invoice-form';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import type { CreateInvoiceProps } from '@/types/pages/invoices';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Create Invoice',
        href: '/invoices/create',
    },
];

export default function CreateInvoice({ products, clients, categories, accounts, invoice }: CreateInvoiceProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Invoice" />
            <InvoiceForm products={products} clients={clients} categories={categories} accounts={accounts} invoice={invoice} />
        </AppLayout>
    );
}
