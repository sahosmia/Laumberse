import AppLayout from '@/layouts/app-layout';
import { formatCurrency as baseFormatCurrency } from '@/lib/format';
import { type BreadcrumbItem, SharedData } from '@/types';
import type { ExpenseShowProps } from '@/types/pages/expenses';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Briefcase, Calendar, CreditCard, Package, Tag, User } from 'lucide-react';

const formatCurrency = (n: number | string) => baseFormatCurrency(n, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function ExpenseShow({ expense }: ExpenseShowProps) {
    const { settings } = usePage<SharedData>().props;
    const salaryCategoryId = settings.salary_category_id;
    const materialExpenseCategoryId = settings.material_expense_category_id;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Expenses', href: '/expenses' },
        { title: `Details ${expense.unique_id || `EXP-${String(expense.id).padStart(4, '0')}`}`, href: `/expenses/${expense.id}` },
    ];

    const isPayroll = Number(expense.expense_category_id) === Number(salaryCategoryId);
    const isMaterial = Number(expense.expense_category_id) === Number(materialExpenseCategoryId);
    const isAsset = !!expense.manage_asset_id;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Expense Details ${expense.unique_id || `EXP-${String(expense.id).padStart(4, '0')}`}`} />

            <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <Link
                        href={route('expenses.index')}
                        className="flex items-center gap-2 text-sm text-neutral-500 transition-colors hover:text-neutral-900"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back to List
                    </Link>
                    <span className="font-mono text-xs text-neutral-400">
                        ID: {expense.unique_id || `EXP-${String(expense.id).padStart(4, '0')}`}
                    </span>
                </div>

                <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="border-b border-neutral-100 p-6 md:p-8 dark:border-neutral-800">
                        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-blue-600 uppercase dark:bg-blue-900/30 dark:text-blue-400">
                                        {expense.category?.name}
                                    </span>
                                </div>
                                <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{formatCurrency(expense.amount)}</h1>
                                <p className="text-sm text-neutral-500">{expense.description || 'No description provided.'}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 md:flex md:gap-8">
                                <div className="space-y-1">
                                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-400 uppercase">
                                        <Calendar className="h-3 w-3" /> Date
                                    </span>
                                    <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{expense.date}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-400 uppercase">
                                        <CreditCard className="h-3 w-3" /> Method
                                    </span>
                                    <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{expense.payment_method}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-neutral-50/50 p-6 md:p-8 dark:bg-neutral-800/20">
                        {isMaterial && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-neutral-100">
                                    <Package className="h-5 w-5 text-blue-600" />
                                    <h3>Material Items</h3>
                                </div>
                                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-neutral-100 bg-neutral-50 text-[10px] font-bold text-neutral-500 uppercase dark:border-neutral-800 dark:bg-neutral-800/50">
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
                                                        {item.quantity}{' '}
                                                        {item.material?.unit?.short_name && (
                                                            <span className="text-xs text-neutral-400">({item.material.unit.short_name})</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-neutral-600 dark:text-neutral-400">
                                                        {formatCurrency(item.unit_price)}
                                                    </td>
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
                                <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-neutral-100">
                                    <User className="h-5 w-5 text-blue-600" />
                                    <h3>Payroll Details</h3>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                                        <div className="flex items-center justify-between border-b border-neutral-50 pb-3 dark:border-neutral-800">
                                            <span className="text-xs font-medium text-neutral-500">Employee Name</span>
                                            <span className="text-sm font-bold">{expense.payroll.employee?.name}</span>
                                        </div>
                                        <div className="flex items-center justify-between border-b border-neutral-50 pb-3 dark:border-neutral-800">
                                            <span className="text-xs font-medium text-neutral-500">Designation</span>
                                            <span className="text-sm">{expense.payroll.employee?.designation}</span>
                                        </div>
                                        <div className="flex items-center justify-between border-b border-neutral-50 pb-3 dark:border-neutral-800">
                                            <span className="text-xs font-medium text-neutral-500">Period</span>
                                            <span className="text-sm font-semibold">
                                                {new Date(0, expense.payroll.month - 1).toLocaleString('default', { month: 'long' })}{' '}
                                                {expense.payroll.year}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-neutral-500">Status</span>
                                            <span
                                                className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                                                    expense.payroll.status === 'completed'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-yellow-100 text-yellow-700'
                                                }`}
                                            >
                                                {expense.payroll.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
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
                                        <div className="flex justify-between border-t border-neutral-50 pt-2 font-bold text-neutral-900 dark:border-neutral-800 dark:text-neutral-100">
                                            <span>Net Salary</span>
                                            <span className="text-blue-600">{formatCurrency(expense.payroll.net_salary)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {isAsset && expense.asset && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-neutral-100">
                                    <Briefcase className="h-5 w-5 text-blue-600" />
                                    <h3>Asset Information</h3>
                                </div>
                                <div className="grid gap-6 rounded-2xl border border-neutral-200 bg-white p-5 md:grid-cols-2 dark:border-neutral-800 dark:bg-neutral-900">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="mb-1 block text-[10px] font-bold text-neutral-400 uppercase">Asset Name</label>
                                            <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{expense.asset.name}</p>
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-[10px] font-bold text-neutral-400 uppercase">Category</label>
                                            <p className="text-sm">{expense.asset.category?.name}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="mb-1 block text-[10px] font-bold text-neutral-400 uppercase">Purchase Date</label>
                                            <p className="text-sm font-semibold">{expense.asset.purchase_date}</p>
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-[10px] font-bold text-neutral-400 uppercase">Asset Status</label>
                                            <span className="rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-neutral-600 uppercase dark:bg-neutral-800 dark:text-neutral-400">
                                                {expense.asset.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!isMaterial && !isPayroll && !isAsset && (
                            <div className="py-8 text-center">
                                <Tag className="mx-auto mb-3 h-12 w-12 text-neutral-200 dark:text-neutral-800" />
                                <p className="text-sm text-neutral-500">General expense details are summarized in the header.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
