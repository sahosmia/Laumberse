import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Payroll {
    id: number;
    employee_id: number;
    employee?: {
        id: number;
        name: string;
    };
    expense_id?: number;
    month: number;
    year: number;
    base_salary: number;
    bonus: number;
    deduction: number;
    net_salary: number;
    paid_amount: number;
    status: 'pending' | 'partial' | 'completed';
    deduction_note?: string;
}

interface PayrollsProps {
    payrolls: Payroll[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Payroll Ledger',
        href: '/payrolls',
    },
];

const formatCurrency = (n: number | string) => `৳${Number(n).toLocaleString("en-BD")}`;

export default function PayrollLedger({ payrolls }: PayrollsProps) {
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'partial': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            default: return 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payroll Ledger" />
            <div className="p-4 space-y-4">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Payroll Ledger</h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">View and track salary disbursement history</p>
                </div>

                {/* Desktop view */}
                <div className="hidden md:block bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 text-xs uppercase tracking-wider">
                                    <th className="text-left px-5 py-3 font-semibold">Employee</th>
                                    <th className="text-left px-5 py-3 font-semibold">Month/Year</th>
                                    <th className="text-right px-5 py-3 font-semibold">Base Salary</th>
                                    <th className="text-right px-5 py-3 font-semibold">Bonus</th>
                                    <th className="text-right px-5 py-3 font-semibold">Deduction</th>
                                    <th className="text-right px-5 py-3 font-semibold">Net Salary</th>
                                    <th className="text-right px-5 py-3 font-semibold">Paid</th>
                                    <th className="text-center px-5 py-3 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {payrolls.map((p) => (
                                    <tr key={p.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
                                        <td className="px-5 py-4 whitespace-nowrap font-medium text-neutral-900 dark:text-neutral-100">
                                            {p.employee?.name}
                                        </td>
                                        <td className="px-5 py-4 text-neutral-600 dark:text-neutral-400">
                                            {new Date(0, p.month - 1).toLocaleString('default', { month: 'short' })} {p.year}
                                        </td>
                                        <td className="px-5 py-4 text-right text-neutral-600 dark:text-neutral-400">{formatCurrency(p.base_salary)}</td>
                                        <td className="px-5 py-4 text-right text-green-600">+{formatCurrency(p.bonus)}</td>
                                        <td className="px-5 py-4 text-right text-red-600">
                                            -{formatCurrency(p.deduction)}
                                            {p.deduction_note && (
                                                <p className="text-[10px] text-neutral-400 italic leading-none">{p.deduction_note}</p>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-right font-bold text-neutral-900 dark:text-neutral-100">{formatCurrency(p.net_salary)}</td>
                                        <td className="px-5 py-4 text-right font-bold text-blue-600">{formatCurrency(p.paid_amount)}</td>
                                        <td className="px-5 py-4 text-center">
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${getStatusStyle(p.status)}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {payrolls.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="px-5 py-10 text-center text-neutral-400 italic">No payroll records found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile view */}
                <div className="block md:hidden space-y-4">
                    {payrolls.map((p) => (
                        <div key={p.id} className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                                        {p.employee?.name}
                                    </h4>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                                        {new Date(0, p.month - 1).toLocaleString('default', { month: 'short' })} {p.year}
                                    </p>
                                </div>
                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${getStatusStyle(p.status)}`}>
                                    {p.status}
                                </span>
                            </div>
                            <div className="border-t border-neutral-100 dark:border-neutral-800 pt-2.5 grid grid-cols-2 gap-y-2.5 gap-x-2 text-xs">
                                <div>
                                    <p className="text-neutral-400 font-medium">Base Salary</p>
                                    <p className="font-semibold text-neutral-700 dark:text-neutral-300">{formatCurrency(p.base_salary)}</p>
                                </div>
                                <div>
                                    <p className="text-neutral-400 font-medium">Bonus</p>
                                    <p className="font-semibold text-green-600">+{formatCurrency(p.bonus)}</p>
                                </div>
                                <div>
                                    <p className="text-neutral-400 font-medium">Deduction</p>
                                    <p className="font-semibold text-red-500">
                                        -{formatCurrency(p.deduction)}
                                        {p.deduction_note && (
                                            <span className="block text-[10px] text-neutral-400 italic leading-none">{p.deduction_note}</span>
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-neutral-400 font-medium">Paid Amount</p>
                                    <p className="font-bold text-blue-600">{formatCurrency(p.paid_amount)}</p>
                                </div>
                            </div>
                            <div className="border-t border-neutral-100 dark:border-neutral-800 pt-2.5 flex justify-between items-center text-xs">
                                <span className="text-neutral-400 font-medium">Net Salary</span>
                                <span className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">{formatCurrency(p.net_salary)}</span>
                            </div>
                        </div>
                    ))}
                    {payrolls.length === 0 && (
                        <div className="p-8 text-center bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-400 italic">
                            No payroll records found
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
