import { Pagination } from '@/components/ui/pagination';
import { PAYROLL_STATUS_STYLES, type PayrollStatus } from '@/constants/status';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/format';
import { type BreadcrumbItem } from '@/types';
import type { PayrollsProps } from '@/types/pages/payrolls';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Payroll Ledger',
        href: '/payrolls',
    },
];

export default function PayrollLedger({ payrolls }: PayrollsProps) {
    const getStatusStyle = (status: PayrollStatus) => PAYROLL_STATUS_STYLES[status] ?? PAYROLL_STATUS_STYLES.pending;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payroll Ledger" />
            <div className="space-y-4 p-4">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Payroll Ledger</h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">View and track salary disbursement history</p>
                </div>

                {/* Desktop view */}
                <div className="hidden overflow-hidden rounded-2xl border border-neutral-200 bg-white md:block dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px] text-sm">
                            <thead>
                                <tr className="bg-neutral-50 text-xs tracking-wider text-neutral-500 uppercase dark:bg-neutral-800/50">
                                    <th className="px-5 py-3 text-left font-semibold">Employee</th>
                                    <th className="px-5 py-3 text-left font-semibold">Month/Year</th>
                                    <th className="px-5 py-3 text-right font-semibold">Base Salary</th>
                                    <th className="px-5 py-3 text-right font-semibold">Bonus</th>
                                    <th className="px-5 py-3 text-right font-semibold">Deduction</th>
                                    <th className="px-5 py-3 text-right font-semibold">Net Salary</th>
                                    <th className="px-5 py-3 text-right font-semibold">Paid</th>
                                    <th className="px-5 py-3 text-center font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {payrolls.data.map((p) => (
                                    <tr key={p.id} className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                                        <td className="px-5 py-4 font-medium whitespace-nowrap text-neutral-900 dark:text-neutral-100">
                                            {p.employee?.name}
                                        </td>
                                        <td className="px-5 py-4 text-neutral-600 dark:text-neutral-400">
                                            {new Date(0, p.month - 1).toLocaleString('default', { month: 'short' })} {p.year}
                                        </td>
                                        <td className="px-5 py-4 text-right text-neutral-600 dark:text-neutral-400">
                                            {formatCurrency(p.base_salary)}
                                        </td>
                                        <td className="px-5 py-4 text-right text-green-600">+{formatCurrency(p.bonus)}</td>
                                        <td className="px-5 py-4 text-right text-red-600">
                                            -{formatCurrency(p.deduction)}
                                            {p.deduction_note && (
                                                <p className="text-[10px] leading-none text-neutral-400 italic">{p.deduction_note}</p>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-right font-bold text-neutral-900 dark:text-neutral-100">
                                            {formatCurrency(p.net_salary)}
                                        </td>
                                        <td className="px-5 py-4 text-right font-bold text-blue-600">{formatCurrency(p.paid_amount)}</td>
                                        <td className="px-5 py-4 text-center">
                                            <span className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase ${getStatusStyle(p.status)}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {payrolls.data.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="px-5 py-10 text-center text-neutral-400 italic">
                                            No payroll records found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile view */}
                <div className="block space-y-4 md:hidden">
                    {payrolls.data.map((p) => (
                        <div
                            key={p.id}
                            className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{p.employee?.name}</h4>
                                    <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                                        {new Date(0, p.month - 1).toLocaleString('default', { month: 'short' })} {p.year}
                                    </p>
                                </div>
                                <span className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase ${getStatusStyle(p.status)}`}>{p.status}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-x-2 gap-y-2.5 border-t border-neutral-100 pt-2.5 text-xs dark:border-neutral-800">
                                <div>
                                    <p className="font-medium text-neutral-400">Base Salary</p>
                                    <p className="font-semibold text-neutral-700 dark:text-neutral-300">{formatCurrency(p.base_salary)}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-neutral-400">Bonus</p>
                                    <p className="font-semibold text-green-600">+{formatCurrency(p.bonus)}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-neutral-400">Deduction</p>
                                    <p className="font-semibold text-red-500">
                                        -{formatCurrency(p.deduction)}
                                        {p.deduction_note && (
                                            <span className="block text-[10px] leading-none text-neutral-400 italic">{p.deduction_note}</span>
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="font-medium text-neutral-400">Paid Amount</p>
                                    <p className="font-bold text-blue-600">{formatCurrency(p.paid_amount)}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between border-t border-neutral-100 pt-2.5 text-xs dark:border-neutral-800">
                                <span className="font-medium text-neutral-400">Net Salary</span>
                                <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{formatCurrency(p.net_salary)}</span>
                            </div>
                        </div>
                    ))}
                    {payrolls.data.length === 0 && (
                        <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center text-neutral-400 italic dark:border-neutral-800 dark:bg-neutral-900">
                            No payroll records found
                        </div>
                    )}
                </div>

                <Pagination links={payrolls.links} />
            </div>
        </AppLayout>
    );
}
