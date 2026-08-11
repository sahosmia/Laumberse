import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, Tag, CreditCard, User, Package, Briefcase } from "lucide-react";
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { formatCurrency as baseFormatCurrency } from '@/lib/format';
import type { ExpenseShowProps } from '@/types/pages/expenses';

const formatCurrency = (n: number | string) => baseFormatCurrency(n, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function ExpenseShow({ expense }: ExpenseShowProps) {
    const { settings } = usePage<SharedData>().props;
    const salaryCategoryId = settings.salary_category_id;
    const materialExpenseCategoryId = settings.material_expense_category_id;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Expenses', href: '/expenses' },
        { title: `Details #${expense.id}`, href: `/expenses/${expense.id}` },
    ];

    const isPayroll = Number(expense.expense_category_id) === Number(salaryCategoryId);
    const isMaterial = Number(expense.expense_category_id) === Number(materialExpenseCategoryId);
    const isAsset = !!expense.manage_asset_id;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Expense Details #${expense.id}`} />

            <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <Link href={route('expenses.index')} className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to List
                    </Link>
                    <span className="text-xs font-mono text-neutral-400">ID: {expense.id}</span>
                </div>

                <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
                    <div className="p-6 md:p-8 border-b border-neutral-100 dark:border-neutral-800">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                                        {expense.category?.name}
                                    </span>
                                </div>
                                <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{formatCurrency(expense.amount)}</h1>
                                <p className="text-neutral-500 text-sm">{expense.description || 'No description provided.'}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 md:flex md:gap-8">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase flex items-center gap-1.5">
                                        <Calendar className="w-3 h-3" /> Date
                                    </span>
                                    <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{expense.date}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase flex items-center gap-1.5">
                                        <CreditCard className="w-3 h-3" /> Method
                                    </span>
                                    <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{expense.payment_method}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 md:p-8 bg-neutral-50/50 dark:bg-neutral-800/20">
                        {isMaterial && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100 font-bold">
                                    <Package className="w-5 h-5 text-blue-600" />
                                    <h3>Material Items</h3>
                                </div>
                                <div className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 text-[10px] uppercase font-bold border-b border-neutral-100 dark:border-neutral-800">
                                                <th className="px-4 py-3 text-left">Material</th>
                                                <th className="px-4 py-3 text-center">Qty</th>
                                                <th className="px-4 py-3 text-right">Unit Price</th>
                                                <th className="px-4 py-3 text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                            {expense.materials?.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="px-4 py-3 font-medium">{item.material?.name}</td>
                                                    <td className="px-4 py-3 text-center text-neutral-600 dark:text-neutral-400">
                                                        {item.quantity} {item.material?.unit?.short_name && <span className="text-xs text-neutral-400">({item.material.unit.short_name})</span>}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-neutral-600 dark:text-neutral-400">{formatCurrency(item.unit_price)}</td>
                                                    <td className="px-4 py-3 text-right font-semibold">{formatCurrency(item.amount)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {isPayroll && expense.payroll && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100 font-bold">
                                    <User className="w-5 h-5 text-blue-600" />
                                    <h3>Payroll Details</h3>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-4">
                                        <div className="flex justify-between items-center pb-3 border-b border-neutral-50 dark:border-neutral-800">
                                            <span className="text-xs text-neutral-500 font-medium">Employee Name</span>
                                            <span className="text-sm font-bold">{expense.payroll.employee?.name}</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-3 border-b border-neutral-50 dark:border-neutral-800">
                                            <span className="text-xs text-neutral-500 font-medium">Designation</span>
                                            <span className="text-sm">{expense.payroll.employee?.designation}</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-3 border-b border-neutral-50 dark:border-neutral-800">
                                            <span className="text-xs text-neutral-500 font-medium">Period</span>
                                            <span className="text-sm font-semibold">{new Date(0, expense.payroll.month - 1).toLocaleString('default', { month: 'long' })} {expense.payroll.year}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-neutral-500 font-medium">Status</span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                expense.payroll.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {expense.payroll.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-neutral-500">Base Salary</span>
                                            <span>{formatCurrency(expense.payroll.base_salary)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-neutral-500">Bonus</span>
                                            <span className="text-green-600">+{formatCurrency(expense.payroll.bonus)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-neutral-500">Deduction</span>
                                            <span className="text-red-600">-{formatCurrency(expense.payroll.deduction)}</span>
                                        </div>
                                        {expense.payroll.deduction_note && (
                                            <p className="text-[10px] text-neutral-400 italic">Note: {expense.payroll.deduction_note}</p>
                                        )}
                                        <div className="pt-2 border-t border-neutral-50 dark:border-neutral-800 flex justify-between font-bold text-neutral-900 dark:text-neutral-100">
                                            <span>Net Salary</span>
                                            <span className="text-blue-600">{formatCurrency(expense.payroll.net_salary)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {isAsset && expense.asset && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100 font-bold">
                                    <Briefcase className="w-5 h-5 text-blue-600" />
                                    <h3>Asset Information</h3>
                                </div>
                                <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 grid md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">Asset Name</label>
                                            <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{expense.asset.name}</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">Category</label>
                                            <p className="text-sm">{expense.asset.category?.name}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">Purchase Date</label>
                                            <p className="text-sm font-semibold">{expense.asset.purchase_date}</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">Asset Status</label>
                                            <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-[10px] font-bold text-neutral-600 dark:text-neutral-400 uppercase">
                                                {expense.asset.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!isMaterial && !isPayroll && !isAsset && (
                            <div className="text-center py-8">
                                <Tag className="w-12 h-12 text-neutral-200 dark:text-neutral-800 mx-auto mb-3" />
                                <p className="text-neutral-500 text-sm">General expense details are summarized in the header.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
