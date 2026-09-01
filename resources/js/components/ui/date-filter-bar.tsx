import { FilterSelect } from '@/components/ui/filter-select';
import { DATE_FILTERS } from '@/constants/date-filters';
import { Calendar } from 'lucide-react';

interface DateFilterBarProps {
    dateFilter: string;
    onDateFilterChange: (value: string) => void;
    isCustomRange: boolean;
    startDate: string;
    onStartDateChange: (value: string) => void;
    endDate: string;
    onEndDateChange: (value: string) => void;
    isSpecificDate: boolean;
    specificDate: string;
    onSpecificDateChange: (value: string) => void;
    containerClassName?: string;
}

/** The date_filter dropdown + custom-range/specific-date inputs, shared by every page that filters by date range. */
export function DateFilterBar({
    dateFilter,
    onDateFilterChange,
    isCustomRange,
    startDate,
    onStartDateChange,
    endDate,
    onEndDateChange,
    isSpecificDate,
    specificDate,
    onSpecificDateChange,
    containerClassName,
}: DateFilterBarProps) {
    return (
        <div className={containerClassName ?? 'flex flex-col gap-2 sm:flex-row sm:items-center'}>
            <FilterSelect
                icon={<Calendar className="h-4 w-4" />}
                containerClassName="w-full sm:w-44"
                value={dateFilter}
                onChange={(e) => onDateFilterChange(e.target.value)}
            >
                {DATE_FILTERS.map((f) => (
                    <option key={f.value} value={f.value}>
                        {f.label}
                    </option>
                ))}
            </FilterSelect>
            {isSpecificDate && (
                <input
                    type="date"
                    value={specificDate}
                    onChange={(e) => onSpecificDateChange(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm transition-all focus:ring-2 focus:ring-blue-500/30 focus:outline-none sm:w-40 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                />
            )}
            {isCustomRange && (
                <>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => onStartDateChange(e.target.value)}
                        className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm transition-all focus:ring-2 focus:ring-blue-500/30 focus:outline-none sm:w-40 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                    />
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => onEndDateChange(e.target.value)}
                        className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm transition-all focus:ring-2 focus:ring-blue-500/30 focus:outline-none sm:w-40 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                    />
                </>
            )}
        </div>
    );
}

/** Human-readable label for the currently selected date filter — used in print headers. */
export function describeDateFilter(dateFilter: string, startDate: string, endDate: string, specificDate?: string): string {
    if (!dateFilter) return 'All Time';
    if (dateFilter === 'specific_date') return specificDate || 'Specific Date';
    if (dateFilter === 'custom') {
        if (startDate && endDate) return `${startDate} to ${endDate}`;
        if (startDate) return `From ${startDate}`;
        if (endDate) return `Until ${endDate}`;
        return 'Custom Range';
    }
    return DATE_FILTERS.find((f) => f.value === dateFilter)?.label ?? dateFilter;
}
