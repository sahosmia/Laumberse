import { Head } from '@inertiajs/react';
import { useEffect } from 'react';

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
    client: { name: string; phone: string; address: string | null; type?: string };
    total: number;
    paid: number;
    due: number;
    status: string;
    method: string;
    remarks: string | null;
    discount_type?: string;
    discount_amount?: number;
    delivery_charge?: number | string | null;
    items: InvoiceItem[];
}

interface PrintProps {
    invoice: Invoice;
}

const formatCurrency = (n: number) => `৳${n.toLocaleString("en-BD")}`;

export default function Print({ invoice }: PrintProps) {
    useEffect(() => {
        window.print();
        // Optional: Close the window after printing if it was opened in a new tab
        // window.onafterprint = () => window.close();
    }, []);

    const itemsSubtotal = invoice.items.reduce((s, i) => s + Number(i.price) * i.qty, 0);

    return (
        <div className="bg-white min-h-screen p-8 text-neutral-900 font-sans" style={{ fontFamily: "'Noto Sans Bengali', 'Instrument Sans', sans-serif" }}>
            <Head title={`Print Invoice ${invoice.id}`} />

            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-black text-blue-600 tracking-tighter">INVOICE</h1>
                        <p className="text-neutral-500 font-mono mt-1 text-lg">{invoice.id}</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-2xl font-bold">Launverse</h2>
                        <p className="text-sm text-neutral-500 italic">Dhaka, Bangladesh</p>
                        <p className="text-sm text-neutral-500 font-medium">Phone: +880 1234 567890</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-12 py-10 border-y-2 border-neutral-100">
                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">Billed To</h3>
                        <div>
                            <p className="font-extrabold text-2xl">{invoice.client.name}</p>
                            <p className="text-neutral-600 text-lg mt-1">{invoice.client.phone}</p>
                            <p className="text-neutral-600 mt-1">{invoice.client.address || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="space-y-4 text-right">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">Invoice Details</h3>
                        <div className="space-y-2">
                            <p className="text-lg"><span className="text-neutral-500">Date:</span> <span className="font-bold">{invoice.date}</span></p>
                            <p className="text-lg"><span className="text-neutral-500">Status:</span> <span className="font-bold">{invoice.status}</span></p>
                            <p className="text-lg"><span className="text-neutral-500">Method:</span> <span className="font-bold">{invoice.method}</span></p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b-2 border-neutral-900 text-neutral-900">
                                <th className="py-4 font-black uppercase text-sm tracking-widest">Description</th>
                                <th className="py-4 text-center font-black uppercase text-sm tracking-widest">Qty</th>
                                <th className="py-4 text-right font-black uppercase text-sm tracking-widest">Price</th>
                                <th className="py-4 text-right font-black uppercase text-sm tracking-widest">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {invoice.items.map((item) => (
                                <tr key={item.id}>
                                    <td className="py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-xl bg-neutral-100 flex-shrink-0 overflow-hidden border border-neutral-200">
                                                {item.product.image_url ? (
                                                    <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-neutral-400 font-black text-xl uppercase">
                                                        {item.product.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="font-bold text-xl text-neutral-800">{item.product.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-5 text-center text-lg">{item.qty}</td>
                                    <td className="py-5 text-right text-lg">{formatCurrency(Number(item.price))}</td>
                                    <td className="py-5 text-right font-black text-lg">{formatCurrency(Number(item.price) * item.qty)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end pt-10">
                    <div className="w-80 space-y-4">
                        <div className="flex justify-between text-lg">
                            <span className="text-neutral-500 font-medium">Subtotal</span>
                            <span className="font-bold">{formatCurrency(itemsSubtotal)}</span>
                        </div>
                        {invoice.discount_amount && Number(invoice.discount_amount) > 0 ? (() => {
                            const disc = Number(invoice.discount_amount) || 0;
                            const discountValue = invoice.discount_type === 'Percentage' ? (itemsSubtotal * disc) / 100 : disc;
                            return (
                                <div className="flex justify-between text-lg text-amber-600">
                                    <span className="font-medium">
                                        Discount ({invoice.discount_type === 'Percentage' ? `Percentage ${invoice.discount_amount}%` : invoice.discount_type})
                                    </span>
                                    <span className="font-bold">
                                        -{formatCurrency(discountValue)}
                                    </span>
                                </div>
                            );
                        })() : null}
                        {invoice.client.type !== 'Corporate' && invoice.delivery_charge && Number(invoice.delivery_charge) > 0 ? (
                            <div className="flex justify-between text-lg text-blue-600">
                                <span className="font-medium">Delivery Charge</span>
                                <span className="font-bold">{formatCurrency(Number(invoice.delivery_charge))}</span>
                            </div>
                        ) : null}
                        <div className="flex justify-between text-lg text-emerald-600">
                            <span className="font-medium">Paid</span>
                            <span className="font-bold">{formatCurrency(Number(invoice.paid))}</span>
                        </div>
                        <div className="flex justify-between text-lg text-red-500 border-b-2 border-neutral-100 pb-4">
                            <span className="font-medium">Due</span>
                            <span className="font-bold">{formatCurrency(Number(invoice.due))}</span>
                        </div>
                        <div className="flex justify-between text-3xl font-black pt-2 text-blue-600">
                            <span>Total</span>
                            <span>{formatCurrency(Number(invoice.total))}</span>
                        </div>
                    </div>
                </div>

                {invoice.remarks && (
                    <div className="pt-12 border-t-2 border-neutral-100">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 mb-3">Remarks</h3>
                        <p className="text-lg text-neutral-700 italic leading-relaxed">{invoice.remarks}</p>
                    </div>
                )}

                <div className="pt-20 text-center text-neutral-400 text-sm">
                    <p>Thank you for your business!</p>
                    <p className="mt-1">This is a computer generated invoice.</p>
                </div>
            </div>
        </div>
    );
}
