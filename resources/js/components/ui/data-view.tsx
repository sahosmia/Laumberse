import { cn } from '@/lib/utils';
import type { PaginationLink } from '@/types/pagination';
import { LayoutGrid, Loader2, RotateCcw, Rows3, Search, SlidersHorizontal } from 'lucide-react';
import * as React from 'react';
import { Pagination } from './pagination';
import { Skeleton } from './skeleton';
import { TableSkeletonRows } from './table-skeleton-rows';

export interface DataViewColumn<T> {
    key: string;
    /** Usually a plain string; pass a node (e.g. a "select all" checkbox) for interactive headers. */
    label: React.ReactNode;
    align?: 'left' | 'right' | 'center';
    className?: string;
    render: (item: T) => React.ReactNode;
}

interface DataViewProps<T> {
    data: T[];
    getKey: (item: T) => number | string;
    loading?: boolean;
    emptyMessage?: string;

    search: string;
    onSearchChange: (value: string) => void;
    searchPlaceholder?: string;

    /** Page-specific filter controls (date range, category select, ...) rendered next to the search box. */
    filters?: React.ReactNode;

    /** Clears search and filters back to defaults. Pass the `reset` from `useDataViewSearch` to show a Reset button. */
    onReset?: () => void;

    /** localStorage key suffix for remembering the chosen view per resource, e.g. "expenses". */
    viewKey: string;
    defaultView?: 'table' | 'card';

    columns?: DataViewColumn<T>[];
    renderCard?: (item: T) => React.ReactNode;
    cardGridClassName?: string;

    pagination: PaginationLink[];
    /** Total item count across all pages — shown as "{page count} of {total}". Omit to hide the count row. */
    total?: number;
    perPage?: number;
    onPerPageChange?: (perPage: number) => void;
    perPageOptions?: number[];
    maxHeight?: string;
}

function useStoredView(viewKey: string, defaultView: 'table' | 'card'): [string, (v: 'table' | 'card') => void] {
    const storageKey = `dataview:view:${viewKey}`;
    const [view, setView] = React.useState<'table' | 'card'>(() => {
        try {
            const stored = localStorage.getItem(storageKey);
            return stored === 'table' || stored === 'card' ? stored : defaultView;
        } catch {
            return defaultView;
        }
    });

    const update = (v: 'table' | 'card') => {
        setView(v);
        try {
            localStorage.setItem(storageKey, v);
        } catch {
            // ignore — per-viewer convenience only
        }
    };

    return [view, update];
}

export function DataView<T>({
    data,
    getKey,
    loading = false,
    emptyMessage = 'No results found',
    search,
    onSearchChange,
    searchPlaceholder = 'Search...',
    filters,
    onReset,
    viewKey,
    defaultView = 'table',
    columns,
    renderCard,
    cardGridClassName = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    pagination,
    total,
    perPage,
    onPerPageChange,
    perPageOptions = [20, 50, 100],
    maxHeight = '65dvh',
}: DataViewProps<T>) {
    const canToggleView = Boolean(columns && renderCard);
    const [storedView, setStoredView] = useStoredView(viewKey, defaultView);
    const view = canToggleView ? storedView : columns ? 'table' : 'card';
    const showPaginationNav = pagination.length > 3;
    const showFooter = showPaginationNav || typeof total === 'number';
    // On mobile, search/filters/reset start collapsed behind a single "Filters" icon so the
    // header isn't a tall stack of full-width controls — only that icon and the view switcher show
    // by default. Unaffected at sm: and up, where everything stays inline as before.
    const [mobileControlsOpen, setMobileControlsOpen] = React.useState(false);

    const viewToggle = canToggleView && (
        <div className="flex items-center gap-1 rounded-xl border border-neutral-200 bg-white p-1 sm:ml-auto dark:border-neutral-700 dark:bg-neutral-900">
            <button
                type="button"
                title="Table view"
                onClick={() => setStoredView('table')}
                className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                    view === 'table'
                        ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                        : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800',
                )}
            >
                <Rows3 className="h-4 w-4" />
            </button>
            <button
                type="button"
                title="Card view"
                onClick={() => setStoredView('card')}
                className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                    view === 'card'
                        ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                        : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800',
                )}
            >
                <LayoutGrid className="h-4 w-4" />
            </button>
        </div>
    );

    return (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            {/* Header band: search, filters, sort, view toggle */}
            <div className="border-b border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-800/40">
                {/* Mobile-only toolbar: everything else stays collapsed behind this until tapped. */}
                <div className="flex items-center justify-between gap-2 sm:hidden">
                    <button
                        type="button"
                        onClick={() => setMobileControlsOpen((o) => !o)}
                        aria-expanded={mobileControlsOpen}
                        className={cn(
                            'flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors',
                            mobileControlsOpen
                                ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-900/20 dark:text-blue-400'
                                : 'border-neutral-200 bg-white text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300',
                        )}
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                        Filters
                    </button>
                    {viewToggle}
                </div>

                <div className={cn('flex-col gap-3 sm:flex sm:flex-row sm:flex-wrap sm:items-center', mobileControlsOpen ? 'mt-3 flex' : 'hidden')}>
                    <div className="relative flex-1 sm:flex-none">
                        {loading ? (
                            <Loader2 className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 animate-spin text-blue-500" />
                        ) : (
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                        )}
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pr-4 pl-10 text-sm transition-all focus:ring-2 focus:ring-blue-500/30 focus:outline-none sm:w-72 dark:border-neutral-700 dark:bg-neutral-900"
                        />
                    </div>

                    {filters}

                    {onReset && (
                        <button
                            type="button"
                            title="Reset search, filters & sort"
                            onClick={onReset}
                            className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Reset
                        </button>
                    )}

                    <div className="hidden sm:flex">{viewToggle}</div>
                </div>
            </div>

            {/* Body: table or card grid, scrollable within a fixed max height */}
            {view === 'table' && columns ? (
                <div className="overflow-auto" style={{ maxHeight }}>
                    <table className="w-full min-w-[600px] text-sm">
                        <thead className="sticky top-0 z-10">
                            <tr className="bg-neutral-50 text-xs tracking-wider text-neutral-500 uppercase dark:bg-neutral-800">
                                {columns.map((col) => (
                                    <th
                                        key={col.key}
                                        className={cn(
                                            'border-b border-neutral-200 px-5 py-3 font-semibold dark:border-neutral-700',
                                            col.align === 'right' && 'text-right',
                                            col.align === 'center' && 'text-center',
                                            !col.align || col.align === 'left' ? 'text-left' : undefined,
                                            col.className,
                                        )}
                                    >
                                        {col.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                            {loading ? (
                                <TableSkeletonRows columns={columns.length} />
                            ) : (
                                data.map((item) => (
                                    <tr key={getKey(item)} className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                                        {columns.map((col) => (
                                            <td
                                                key={col.key}
                                                className={cn(
                                                    'px-4 py-2.5 sm:px-5 sm:py-3',
                                                    col.align === 'right' && 'text-right',
                                                    col.align === 'center' && 'text-center',
                                                    col.className,
                                                )}
                                            >
                                                {col.render(item)}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                            {!loading && data.length === 0 && (
                                <tr>
                                    <td colSpan={columns.length} className="px-5 py-10 text-center text-neutral-400 italic">
                                        {emptyMessage}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="overflow-auto" style={{ maxHeight }}>
                    <div className={cn('grid gap-4 p-4', cardGridClassName)}>
                        {loading
                            ? Array.from({ length: 6 }).map((_, i) => (
                                  <div key={i} className="space-y-3 rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
                                      <Skeleton className="h-10 w-10 rounded-2xl" />
                                      <Skeleton className="h-4 w-2/3" />
                                      <Skeleton className="h-3 w-1/2" />
                                  </div>
                              ))
                            : renderCard && data.map((item) => <React.Fragment key={getKey(item)}>{renderCard(item)}</React.Fragment>)}
                    </div>
                    {!loading && data.length === 0 && <div className="py-16 text-center text-neutral-400 italic">{emptyMessage}</div>}
                </div>
            )}

            {/* Footer band: item count, rows-per-page, and page navigation */}
            {showFooter && (
                <div className="flex flex-col items-center justify-between gap-3 border-t border-neutral-200 bg-neutral-50 p-4 sm:flex-row dark:border-neutral-800 dark:bg-neutral-800/40">
                    <div className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
                        {typeof total === 'number' && (
                            <span>
                                {data.length} of {total}
                            </span>
                        )}
                        {onPerPageChange && (
                            <label className="flex items-center gap-1.5">
                                <span className="hidden sm:inline">Rows:</span>
                                <select
                                    value={perPage}
                                    onChange={(e) => onPerPageChange(Number(e.target.value))}
                                    className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500/30 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900"
                                >
                                    {perPageOptions.map((n) => (
                                        <option key={n} value={n}>
                                            {n}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        )}
                    </div>
                    {showPaginationNav && <Pagination links={pagination} />}
                </div>
            )}
        </div>
    );
}
