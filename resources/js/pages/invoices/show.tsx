import { Head, Link } from '@inertiajs/react';
import { Printer, ArrowLeft, Download, CreditCard, Calendar, User, Package, Edit3 } from 'lucide-react';
import { useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';

interface InvoiceItem {
    id: number;
    product: {
        name: string;
        image_url?: string | null;
    };
    qty: number;
    price: number;
}

interface Invoice {
    id: string;
    date: string;
    client: { name: string; phone: string; address: string | null };
    total: number;
    paid: number;
    due: number;
    status: string;
    method: string;
    remarks: string | null;
    discount_type: string;
    discount_amount: number;
    delivery_charge?: number | string | null;
    items: InvoiceItem[];
}

interface InvoiceDetailProps {
    invoice: Invoice;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Invoice History', href: '/invoices' },
    { title: 'Invoice Detail', href: '#' },
];

const formatCurrency = (n: number) => `৳${n.toLocaleString("en-BD")}`;

export default function InvoiceDetail({ invoice }: InvoiceDetailProps) {
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.has('print')) {
            window.print();
        }
    }, []);

    const handlePrint = () => {
        window.open(route('invoices.print', invoice.id), '_blank');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Invoice ${invoice.id}`} />
            <div className="p-4 max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between no-print">
                    <Button variant="ghost" asChild>
                        <Link href={route('history')}>
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to History
                        </Link>
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={route('invoices.edit', invoice.id)}>
                                <Edit3 className="w-4 h-4 mr-2" /> Edit
                            </Link>
                        </Button>
                        <Button variant="outline" onClick={handlePrint}>
                            <Printer className="w-4 h-4 mr-2" /> Print
                        </Button>
                        <a href={route('invoices.print', invoice.id)} target="_blank" rel="noopener noreferrer">
                            <Button>
                                <Download className="w-4 h-4 mr-2" /> Download
                            </Button>
                        </a>
                    </div>
                </div>

                <div id="invoice-content" className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm p-8 space-y-8 print:border-0 print:shadow-none">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-blue-600">INVOICE</h1>
                            <p className="text-neutral-500 font-mono mt-1">{invoice.id}</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-xl font-bold">Launverse</h2>
                            <p className="text-sm text-neutral-500">Dhaka, Bangladesh</p>
                            <p className="text-sm text-neutral-500">Phone: +880 1234 567890</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 py-8 border-y border-neutral-100 dark:border-neutral-800">
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                                <User className="w-3 h-3" /> Billed To
                            </h3>
                            <div>
                                <p className="font-bold text-lg">{invoice.client.name}</p>
                                <p className="text-neutral-600 dark:text-neutral-400">{invoice.client.phone}</p>
                                <p className="text-neutral-600 dark:text-neutral-400">{invoice.client.address || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="space-y-3 text-right">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2 justify-end">
                                <Calendar className="w-3 h-3" /> Invoice Details
                            </h3>
                            <div className="space-y-1">
                                <p className="text-sm"><span className="text-neutral-500">Date:</span> <span className="font-medium">{invoice.date}</span></p>
                                <p className="text-sm"><span className="text-neutral-500">Status:</span> <span className="font-medium">{invoice.status}</span></p>
                                <p className="text-sm"><span className="text-neutral-500">Method:</span> <span className="font-medium">{invoice.method}</span></p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                            <Package className="w-3 h-3" /> Items & Services
                        </h3>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-neutral-100 dark:border-neutral-800 text-neutral-500">
                                    <th className="text-left py-3 font-semibold">Description</th>
                                    <th className="text-center py-3 font-semibold">Qty</th>
                                    <th className="text-right py-3 font-semibold">Price</th>
                                    <th className="text-right py-3 font-semibold">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800">
                                {invoice.items.map((item) => (
                                    <tr key={item.id}>
                                        <td className="py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex-shrink-0 overflow-hidden border border-neutral-200 dark:border-neutral-800">
                                                    {item.product.image_url ? (
                                                        <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-neutral-400 font-bold text-xs uppercase">
                                                            {item.product.name.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="font-medium">{item.product.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 text-center">{item.qty}</td>
                                        <td className="py-4 text-right">{formatCurrency(Number(item.price))}</td>
                                        <td className="py-4 text-right font-bold">{formatCurrency(Number(item.price) * item.qty)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end pt-8">
                        {(() => {
                            const subtotal = invoice.items.reduce((s, i) => s + Number(i.price) * i.qty, 0);
                            const disc = Number(invoice.discount_amount) || 0;
                            const calculatedDiscountAmount = invoice.discount_type === 'Percentage' ? (subtotal * disc) / 100 : disc;
                            return (
                                <div className="w-64 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-500">Subtotal</span>
                                        <span className="font-medium">{formatCurrency(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-amber-600">
                                        <span>Discount {invoice.discount_type === 'Percentage' && invoice.discount_amount ? `(${invoice.discount_amount}%)` : ''}</span>
                                        <span>-{formatCurrency(calculatedDiscountAmount)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-blue-600 font-medium">
                                        <span>Delivery Charge</span>
                                        <span>{formatCurrency(Number(invoice.delivery_charge || 0))}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-emerald-600 font-medium">
                                        <span>Paid</span>
                                        <span>{formatCurrency(Number(invoice.paid))}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-red-500 font-medium border-b border-neutral-100 dark:border-neutral-800 pb-3">
                                        <span>Due</span>
                                        <span>{formatCurrency(Number(invoice.due))}</span>
                                    </div>
                                    <div className="flex justify-between text-xl font-bold pt-1 text-blue-600">
                                        <span>Total</span>
                                        <span>{formatCurrency(Number(invoice.total))}</span>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                    {invoice.remarks && (
                        <div className="pt-8 border-t border-neutral-100 dark:border-neutral-800">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Remarks</h3>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 italic">{invoice.remarks}</p>
                        </div>
                    )}
                </div>

                <style dangerouslySetInnerHTML={{ __html: `
                    @media print {
                        .no-print { display: none !important; }
                        body { background: white !important; }
                        #invoice-content { border: 0 !important; box-shadow: none !important; padding: 0 !important; }
                    }
                `}} />
            </div>
        </AppLayout>
    );
}
