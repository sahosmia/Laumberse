import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

/**
 * Debounced date_filter/start_date/end_date/specific_date state for pages that aren't
 * DataView-backed — e.g. a single record's transaction-history "show" page. Same debounce
 * mechanics as useDebouncedSearch, but takes an already-resolved URL instead of a route name,
 * since these pages need a route parameter (the record id) that useDebouncedSearch has no way
 * to supply.
 */
export function useDateRangeFilter(
    url: string,
    filters: { date_filter?: string; start_date?: string; end_date?: string; specific_date?: string },
    delay = 300,
) {
    const [dateFilter, setDateFilter] = useState(filters.date_filter || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [specificDate, setSpecificDate] = useState(filters.specific_date || '');
    const isCustomRange = dateFilter === 'custom';
    const isSpecificDate = dateFilter === 'specific_date';

    useEffect(() => {
        const timeout = setTimeout(() => {
            const params: Record<string, string> = {};
            if (dateFilter) params.date_filter = dateFilter;
            if (isCustomRange) {
                if (startDate) params.start_date = startDate;
                if (endDate) params.end_date = endDate;
            }
            if (isSpecificDate && specificDate) params.specific_date = specificDate;

            router.get(url, params, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, delay);
        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dateFilter, startDate, endDate, specificDate]);

    const reset = () => {
        setDateFilter('');
        setStartDate('');
        setEndDate('');
        setSpecificDate('');
    };

    return {
        dateFilter,
        setDateFilter,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        specificDate,
        setSpecificDate,
        isCustomRange,
        isSpecificDate,
        reset,
    };
}
