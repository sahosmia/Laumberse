import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import InvoiceForm from '@/components/invoice-form';
import type { CreateInvoiceProps } from '@/types/pages/invoices';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Create Invoice',
        href: '/invoices/create',
    },
];

export default function CreateInvoice({ products, clients, categories, invoice }: CreateInvoiceProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Invoice" />
            <InvoiceForm
                products={products}
                clients={clients}
                categories={categories}
                invoice={invoice}
            />
        </AppLayout>
    );
}
