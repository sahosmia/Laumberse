import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Category, Product, Client, Invoice } from '@/types';
import InvoiceForm from '@/components/invoice-form';

interface EditInvoiceProps {
    invoice: Invoice;
    products: Product[];
    clients: Client[];
    categories: Category[];
}

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
            <InvoiceForm
                invoice={invoice}
                products={products}
                clients={clients}
                categories={categories}
                isEdit={true}
            />
        </AppLayout>
    );
}
