import { Pagination } from '@/components/ui/pagination';
import ClientPortalLayout from '@/layouts/client-portal-layout';
import { formatCurrency } from '@/lib/format';
import type { PortalPricesProps } from '@/types/pages/portal';
import { Head } from '@inertiajs/react';

export default function PortalPrices({ prices }: PortalPricesProps) {
    return (
        <ClientPortalLayout>
            <Head title="My Prices" />
            <div className="space-y-4">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">My Prices</h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Special pricing set up for your account</p>
                </div>

                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-neutral-200 bg-neutral-50 text-xs tracking-wider text-neutral-500 uppercase dark:border-neutral-800 dark:bg-neutral-800/50">
                                    <th className="px-5 py-3 text-left font-semibold">Product</th>
                                    <th className="px-5 py-3 text-right font-semibold">Your Price</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {prices.data.map((cp) => (
                                    <tr key={cp.id} className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                                        <td className="px-5 py-4 font-medium text-neutral-900 dark:text-neutral-100">{cp.product?.name}</td>
                                        <td className="px-5 py-4 text-right font-bold text-blue-600">{formatCurrency(Number(cp.custom_price))}</td>
                                    </tr>
                                ))}
                                {prices.data.length === 0 && (
                                    <tr>
                                        <td colSpan={2} className="px-5 py-10 text-center text-neutral-400 italic">
                                            No special pricing set up for your account yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <Pagination links={prices.links} />
            </div>
        </ClientPortalLayout>
    );
}
