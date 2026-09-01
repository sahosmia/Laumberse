import { formatCurrency, formatDate } from '@/lib/format';
import type { PosPrintProps } from '@/types/pages/invoices';
import { Head } from '@inertiajs/react';
import { useEffect } from 'react';

/**
 * 80mm POS/thermal receipt layout — deliberately plain (monospace, no images, no rounded cards):
 * this prints via the OS print dialog straight to a thermal printer, not to paper stock that can
 * absorb the app's usual visual style. Auto-triggers the print dialog on load since this page's
 * only purpose is printing (unlike invoices/show.tsx, which is also a normal viewing page).
 */
export default function InvoicePosPrint({ invoice }: PosPrintProps) {
    const subtotal = invoice.items.reduce((s, i) => s + Number(i.price) * i.qty, 0);
    const discountAmount = Number(invoice.discount_amount) || 0;
    const discountValue = invoice.discount_type === 'Percentage' ? (subtotal * discountAmount) / 100 : discountAmount;
    const deliveryCharge = invoice.client.type !== 'Corporate' ? Number(invoice.delivery_charge || 0) : 0;
    const due = Number(invoice.total) - Number(invoice.paid);

    useEffect(() => {
        window.print();
    }, []);

    return (
        <>
            <Head title={`Receipt ${invoice.invoice_uuid}`} />
            <div className="mx-auto w-[302px] bg-white px-2 py-3 font-mono text-[11px] leading-snug text-black">
                <div className="space-y-0.5 text-center">
                    <p className="text-sm font-bold">Launverse</p>
                    <p>Dhaka, Bangladesh</p>
                    <p>Phone: +880 1234 567890</p>
                </div>

                <div className="my-2 border-t border-dashed border-black" />

                <div className="space-y-0.5">
                    <div className="flex justify-between">
                        <span>Receipt#</span>
                        <span className="font-bold">{invoice.invoice_uuid}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Date</span>
                        <span>{formatDate(invoice.date)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Client</span>
                        <span className="max-w-[70%] truncate text-right">{invoice.client.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Phone</span>
                        <span>{invoice.client.phone}</span>
                    </div>
                </div>

                <div className="my-2 border-t border-dashed border-black" />

                <div>
                    {invoice.items.map((item) => (
                        <div key={item.id} className="mb-1">
                            <div className="truncate">{item.product.name}</div>
                            <div className="flex justify-between text-neutral-700">
                                <span>
                                    {item.qty} x {formatCurrency(Number(item.price))}
                                </span>
                                <span>{formatCurrency(Number(item.price) * item.qty)}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="my-2 border-t border-dashed border-black" />

                <div className="space-y-0.5">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{formatCurrency(subtotal)}</span>
                    </div>
                    {discountValue > 0 && (
                        <div className="flex justify-between">
                            <span>Discount</span>
                            <span>-{formatCurrency(discountValue)}</span>
                        </div>
                    )}
                    {deliveryCharge > 0 && (
                        <div className="flex justify-between">
                            <span>Delivery</span>
                            <span>{formatCurrency(deliveryCharge)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-sm font-bold">
                        <span>Total</span>
                        <span>{formatCurrency(Number(invoice.total))}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Paid</span>
                        <span>{formatCurrency(Number(invoice.paid))}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Due</span>
                        <span>{formatCurrency(due)}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                        <span>Status</span>
                        <span>{invoice.payment_status}</span>
                    </div>
                </div>

                <div className="my-2 border-t border-dashed border-black" />

                <p className="text-center">Thank you for choosing Launverse!</p>
            </div>

            <style
                dangerouslySetInnerHTML={{
                    __html: `
                @page { size: 80mm auto; margin: 0; }
                @media print {
                    body { background: white !important; }
                }
            `,
                }}
            />
        </>
    );
}
