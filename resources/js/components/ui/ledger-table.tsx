import { cn } from '@/lib/utils';
import type { PaginationLink } from '@/types/pagination';
import * as React from 'react';
import { Pagination } from './pagination';

export interface LedgerColumn<T> {
    key: string;
    label: React.ReactNode;
    align?: 'left' | 'right' | 'center';
    className?: string;
    render: (row: T) => React.ReactNode;
}

interface LedgerTableProps<T> {
    data: T[];
    getKey: (row: T) => number | string;
    /** Desktop table columns — same shape as DataView's DataViewColumn. Purely presentational: pass already-computed cell content (debit/credit amounts, badges, balance styling), not raw transaction data the component would have to interpret itself. */
    columns: LedgerColumn<T>[];
    /** Mobile row — full control over what's shown, mirroring DataView's renderCard. */
    renderCard: (row: T) => React.ReactNode;
    pagination: PaginationLink[];
    emptyMessage?: string;
}

/**
 * Shared desktop-table / mobile-card ledger view for entity "show" pages (Account, Employee,
 * Investor, Company Loan transaction history). Replaces four near-identical hand-rolled
 * `<table>` blocks that had no mobile alternative beyond horizontal scrolling — mirrors, on the
 * frontend, the same duplication `App\Support\LedgerQuery` already unified on the backend query
 * side. Deliberately has no notion of "debit", "credit", "balance", or any entity-specific
 * concept: every cell and every card is rendered exactly as the page tells it to.
 */
export function LedgerTable<T>({ data, getKey, columns, renderCard, pagination, emptyMessage = 'No transactions found' }: LedgerTableProps<T>) {
    return (
        <div className="space-y-3">
            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-2xl border border-neutral-200 bg-white md:block dark:border-neutral-800 dark:bg-neutral-900">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-200 bg-neutral-50 text-xs tracking-wider text-neutral-500 uppercase dark:border-neutral-800 dark:bg-neutral-800/50">
                                {columns.map((col) => (
                                    <th
                                        key={col.key}
                                        className={cn(
                                            'px-5 py-3 font-semibold',
                                            col.align === 'right' && 'text-right',
                                            col.align === 'center' && 'text-center',
                                            (!col.align || col.align === 'left') && 'text-left',
                                            col.className,
                                        )}
                                    >
                                        {col.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                            {data.map((row) => (
                                <tr key={getKey(row)}>
                                    {columns.map((col) => (
                                        <td
                                            key={col.key}
                                            className={cn(
                                                'px-5 py-4',
                                                col.align === 'right' && 'text-right',
                                                col.align === 'center' && 'text-center',
                                                col.className,
                                            )}
                                        >
                                            {col.render(row)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            {data.length === 0 && (
                                <tr>
                                    <td colSpan={columns.length} className="px-5 py-10 text-center text-neutral-400 italic">
                                        {emptyMessage}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
                {data.map((row) => (
                    <React.Fragment key={getKey(row)}>{renderCard(row)}</React.Fragment>
                ))}
                {data.length === 0 && (
                    <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center text-neutral-400 italic dark:border-neutral-800 dark:bg-neutral-900">
                        {emptyMessage}
                    </div>
                )}
            </div>

            <Pagination links={pagination} />
        </div>
    );
}
