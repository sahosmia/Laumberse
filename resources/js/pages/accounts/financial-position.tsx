import { FormInput } from '@/components/ui/form-input';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatDate } from '@/lib/format';
import { type BreadcrumbItem } from '@/types';
import type { FinancialPositionProps } from '@/types/pages/financial-position';
import { Head, router } from '@inertiajs/react';
import { ChevronDown, ChevronRight, Printer, Scale, X } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Accounts', href: '/accounts' },
    { title: 'Financial Position', href: '/accounts/financial-position' },
];

type RowGroup = {
    key: string;
    label: string;
    total: number;
    items: { key: string; label: string; amount: number }[];
};

function ExpandableRow({ group, tone }: { group: RowGroup; tone: 'liability' | 'asset' }) {
    const [open, setOpen] = useState(false);
    const hasItems = group.items.length > 0;

    return (
        <>
            <tr className={hasItems ? 'cursor-pointer' : ''} onClick={() => hasItems && setOpen((o) => !o)}>
                <td className="px-5 py-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    <span className="flex items-center gap-1.5">
                        {hasItems &&
                            (open ? (
                                <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
                            ) : (
                                <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
                            ))}
                        {group.label}
                    </span>
                </td>
                <td className="px-5 py-3 text-right text-sm font-semibold text-neutral-900 dark:text-neutral-100">{formatCurrency(group.total)}</td>
            </tr>
            {open &&
                group.items.map((item) => (
                    <tr key={item.key} className="bg-neutral-50/60 dark:bg-neutral-800/20">
                        <td className="py-2 pr-5 pl-10 text-xs text-neutral-500 dark:text-neutral-400">{item.label}</td>
                        <td
                            className={`py-2 pr-5 text-right text-xs font-medium ${
                                tone === 'liability' ? 'text-neutral-600 dark:text-neutral-400' : 'text-neutral-600 dark:text-neutral-400'
                            }`}
                        >
                            {formatCurrency(item.amount)}
                        </td>
                    </tr>
                ))}
            {open && !hasItems && (
                <tr className="bg-neutral-50/60 dark:bg-neutral-800/20">
                    <td colSpan={2} className="py-2 pr-5 pl-10 text-xs text-neutral-400 italic">
                        No records
                    </td>
                </tr>
            )}
        </>
    );
}

/** Print-only counterpart to ExpandableRow — always shows the full breakdown, since a printed statement can't be clicked open. */
function PrintGroup({ group }: { group: RowGroup }) {
    return (
        <>
            <tr>
                <td className="py-1 pr-2 font-semibold text-neutral-900">{group.label}</td>
                <td className="py-1 text-right font-semibold text-neutral-900">{formatCurrency(group.total)}</td>
            </tr>
            {group.items.length > 0 ? (
                group.items.map((item) => (
                    <tr key={item.key}>
                        <td className="py-0.5 pr-2 pl-4 text-neutral-600">{item.label}</td>
                        <td className="py-0.5 text-right text-neutral-600">{formatCurrency(item.amount)}</td>
                    </tr>
                ))
            ) : (
                <tr>
                    <td colSpan={2} className="py-0.5 pl-4 text-neutral-400 italic">
                        No records
                    </td>
                </tr>
            )}
        </>
    );
}

export default function FinancialPosition({ as_of_date, liabilities, assets }: FinancialPositionProps) {
    // Defaults the picker to today so it never looks blank on first visit — the figures shown are
    // still the live ones (no as_of_date param sent) unless the user actually changes the date.
    const [dateInput, setDateInput] = useState(as_of_date ?? new Date().toISOString().slice(0, 10));

    const applyAsOfDate = (value: string) => {
        router.get(route('accounts.financial-position'), value ? { as_of_date: value } : {}, { preserveScroll: true, preserveState: true });
    };

    const liabilityGroups: RowGroup[] = [
        {
            key: 'capital',
            label: 'Capital',
            total: liabilities.capital.total,
            items: liabilities.capital.items.map((i) => ({
                key: `investor-${i.id}`,
                label: i.name,
                amount: Number(i.current_balance),
            })),
        },
        {
            key: 'company_loan',
            label: 'Company Loan',
            total: liabilities.company_loan.total,
            items: liabilities.company_loan.items.map((l) => ({
                key: `loan-${l.id}`,
                label: l.lender_name,
                amount: Number(l.current_balance),
            })),
        },
    ];

    const assetGroups: RowGroup[] = [
        {
            key: 'sundry_debtors',
            label: 'Sundry Debtors',
            total: assets.sundry_debtors.total,
            items: assets.sundry_debtors.items.map((c) => ({
                key: `debtor-${c.id}`,
                label: c.name,
                amount: Number(c.total_due),
            })),
        },
        {
            key: 'cash_at_bank',
            label: 'Cash at Bank',
            total: assets.cash_at_bank.total,
            items: assets.cash_at_bank.items.map((a) => ({
                key: `account-${a.id}`,
                label: a.account_number ? `${a.name} (${a.account_number})` : a.name,
                amount: Number(a.current_balance),
            })),
        },
        {
            key: 'staff_advances',
            label: 'Company / Staff Advances',
            total: assets.staff_advances.total,
            items: assets.staff_advances.items.map((e) => ({
                key: `employee-${e.id}`,
                label: e.name,
                amount: Number(e.current_balance),
            })),
        },
        {
            key: 'other_assets',
            label: 'Other Assets',
            total: assets.other_assets.total,
            items: assets.other_assets.items.map((a) => ({
                key: `asset-${a.id}`,
                label: a.name,
                amount: Number(a.cost),
            })),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Financial Position" />
            <div className="space-y-4 p-4">
                <div className="no-print flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                            <Scale className="h-4 w-4" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Financial Position</h1>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                Click a row to see its breakdown. Capital comes from the Investor ledger; Gross Profit is the balancing figure (Total
                                Assets − Capital − Company Loan) so both totals always match.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <FormInput
                            type="date"
                            title="As of date"
                            value={dateInput}
                            onChange={(e) => {
                                setDateInput(e.target.value);
                                applyAsOfDate(e.target.value);
                            }}
                            className="h-10 rounded-xl border-neutral-200 bg-transparent dark:border-neutral-800 dark:text-neutral-100"
                        />
                        {as_of_date && (
                            <button
                                type="button"
                                onClick={() => {
                                    setDateInput('');
                                    applyAsOfDate('');
                                }}
                                className="flex h-10 items-center gap-1.5 rounded-xl bg-neutral-100 px-3 text-sm font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                                title="Back to live figures"
                            >
                                <X className="h-4 w-4" /> Live
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="flex h-10 items-center gap-2 rounded-xl bg-neutral-100 px-4 text-sm font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                        >
                            <Printer className="h-4 w-4" /> Print
                        </button>
                    </div>
                </div>

                <div className="no-print grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="border-b border-neutral-100 bg-neutral-50 px-5 py-3 dark:border-neutral-800 dark:bg-neutral-800/50">
                            <h2 className="text-xs font-bold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">Liabilities / DR</h2>
                        </div>
                        <table className="w-full text-sm">
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {liabilityGroups.map((group) => (
                                    <ExpandableRow key={group.key} group={group} tone="liability" />
                                ))}
                                <tr>
                                    <td className="px-5 py-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">Gross Profit</td>
                                    <td
                                        className={`px-5 py-3 text-right text-sm font-semibold ${
                                            liabilities.gross_profit < 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                                        }`}
                                    >
                                        {formatCurrency(liabilities.gross_profit)}
                                    </td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr className="border-t border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800/50">
                                    <td className="px-5 py-3 text-sm font-bold text-neutral-900 dark:text-neutral-100">Total Liability</td>
                                    <td className="px-5 py-3 text-right text-sm font-bold text-neutral-900 dark:text-neutral-100">
                                        {formatCurrency(liabilities.total)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="border-b border-neutral-100 bg-neutral-50 px-5 py-3 dark:border-neutral-800 dark:bg-neutral-800/50">
                            <h2 className="text-xs font-bold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">Assets / CR</h2>
                        </div>
                        <table className="w-full text-sm">
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {assetGroups.map((group) => (
                                    <ExpandableRow key={group.key} group={group} tone="asset" />
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="border-t border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800/50">
                                    <td className="px-5 py-3 text-sm font-bold text-neutral-900 dark:text-neutral-100">Total Assets</td>
                                    <td className="px-5 py-3 text-right text-sm font-bold text-neutral-900 dark:text-neutral-100">
                                        {formatCurrency(assets.total)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Print-only statement — clean, fully-expanded, no interactive chrome. Screen view above is hidden via .no-print. */}
                <div className="hidden print:block">
                    <div className="mb-6 flex items-end justify-between border-b-2 border-neutral-900 pb-3">
                        <h1 className="text-xl font-bold text-neutral-900">Financial Position</h1>
                        <p className="text-xs text-neutral-500">As of {as_of_date ? formatDate(as_of_date) : formatDate(new Date())}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h2 className="mb-2 border-b border-neutral-400 pb-1 text-xs font-bold tracking-wide text-neutral-700 uppercase">
                                Liabilities / DR
                            </h2>
                            <table className="w-full text-xs">
                                <tbody>
                                    {liabilityGroups.map((group) => (
                                        <PrintGroup key={group.key} group={group} />
                                    ))}
                                    <tr>
                                        <td className="py-1 pr-2 font-semibold text-neutral-900">Gross Profit</td>
                                        <td className="py-1 text-right font-semibold text-neutral-900">{formatCurrency(liabilities.gross_profit)}</td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr className="border-t-2 border-neutral-900">
                                        <td className="pt-1.5 pr-2 font-bold text-neutral-900">Total Liability</td>
                                        <td className="pt-1.5 text-right font-bold text-neutral-900">{formatCurrency(liabilities.total)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <div>
                            <h2 className="mb-2 border-b border-neutral-400 pb-1 text-xs font-bold tracking-wide text-neutral-700 uppercase">
                                Assets / CR
                            </h2>
                            <table className="w-full text-xs">
                                <tbody>
                                    {assetGroups.map((group) => (
                                        <PrintGroup key={group.key} group={group} />
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t-2 border-neutral-900">
                                        <td className="pt-1.5 pr-2 font-bold text-neutral-900">Total Assets</td>
                                        <td className="pt-1.5 text-right font-bold text-neutral-900">{formatCurrency(assets.total)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <style
                dangerouslySetInnerHTML={{
                    __html: `
                    @media print {
                        .no-print { display: none !important; }
                        @page { margin: 1.2cm; }
                        body { background: white !important; }
                    }
                `,
                }}
            />
        </AppLayout>
    );
}
