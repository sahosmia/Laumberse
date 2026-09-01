import { useState } from 'react';
import { useDebouncedSearch } from './use-debounced-search';

interface DataViewFilters {
    search?: string;
    sort?: string;
    per_page?: string | number;
}

/**
 * Wires up the `search` + `sort` + `perPage` + (optionally) page-specific filter
 * state every DataView-backed index page needs, and debounces all of it — together
 * with whatever other params the page still manages externally via `extraParams` —
 * into a single Inertia GET. Also returns a `reset()` that clears search, sort,
 * perPage, and every hook-managed filter back to defaults, for a page's "Reset"
 * button.
 *
 * Two ways to feed it page-specific filters:
 * - Hook-managed (preferred, works with `reset()`): pass their initial values in
 *   `filterDefaults` (e.g. `{ category_id: filters.category_id || '' }`), then read
 *   `filterValues.category_id` / call `setFilter('category_id', value)`.
 * - Externally managed (legacy): keep the filter as its own `useState` and pass its
 *   current value in `extraParams` (a fresh object each render) — it rides along in
 *   the same debounced request but isn't touched by `reset()`.
 */
export function useDataViewSearch(
    routeName: string,
    filters: DataViewFilters,
    extraParams: Record<string, string | undefined> = {},
    defaultSort = 'created_at:desc',
    delay = 300,
    filterDefaults: Record<string, string> = {},
    defaultPerPage = 50,
) {
    const [search, setSearch] = useState(filters.search || '');
    const [sort, setSort] = useState(filters.sort || defaultSort);
    const [perPage, setPerPage] = useState(filters.per_page ? Number(filters.per_page) : defaultPerPage);
    const [filterValues, setFilterValues] = useState<Record<string, string>>(filterDefaults);

    useDebouncedSearch(routeName, search, delay, { ...extraParams, ...filterValues, sort, per_page: String(perPage) });

    const setFilter = (key: string, value: string) => {
        setFilterValues((prev) => ({ ...prev, [key]: value }));
    };

    const reset = () => {
        setSearch('');
        setSort(defaultSort);
        setPerPage(defaultPerPage);
        setFilterValues(Object.fromEntries(Object.keys(filterDefaults).map((key) => [key, ''])));
    };

    return { search, setSearch, sort, setSort, perPage, setPerPage, filterValues, setFilter, reset };
}
