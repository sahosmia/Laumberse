import { router } from '@inertiajs/react';
import { useEffect } from 'react';

/** Debounces `search` and pushes it to the server as a query-string filter, preserving state/scroll. */
export function useDebouncedSearch(routeName: string, search: string, delay = 300) {
    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(route(routeName), search ? { search } : {}, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, delay);
        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);
}
