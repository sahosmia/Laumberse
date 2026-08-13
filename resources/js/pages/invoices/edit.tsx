import InvoiceForm from '@/components/invoice-form';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import type { EditInvoiceProps } from '@/types/pages/invoices';
import { Head } from '@inertiajs/react';

export default function EditInvoice({ invoice, products, clients, categories }: EditInvoiceProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Invoices',
            href: '/invoices',
        },
        {
            title: 'Edit Invoice',
            href: `/invoices/${invoice.id}/edit`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Invoice ${invoice.invoice_uuid}`} />
            <InvoiceForm invoice={invoice} products={products} clients={clients} categories={categories} isEdit={true} />
        </AppLayout>
    );
}
