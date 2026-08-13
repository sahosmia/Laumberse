import { router } from '@inertiajs/react';
import { useEffect } from 'react';

/**
 * Debounces `search` (plus any extra filter values) and pushes them to the server
 * as query-string filters, preserving state/scroll.
 */
export function useDebouncedSearch(routeName: string, search: string, delay = 300, extraParams: Record<string, string | undefined> = {}) {
    const extraParamsKey = JSON.stringify(extraParams);

    useEffect(() => {
        const timeout = setTimeout(() => {
            const params: Record<string, string> = {};
            if (search) params.search = search;
            Object.entries(extraParams).forEach(([key, value]) => {
                if (value) params[key] = value;
            });

            router.get(route(routeName), params, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, delay);
        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, extraParamsKey]);
}
