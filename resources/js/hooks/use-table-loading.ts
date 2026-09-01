import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

/**
 * Tracks whether the current page's list is being refreshed — a debounced
 * search typing, a filter change, or a pagination click all issue a GET
 * request back to the same URL path. Scoping to GET + same pathname keeps
 * this from lighting up for unrelated requests on the page (modal
 * create/update/delete, bulk actions), which use other methods or paths.
 */
export function useTableLoading() {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const isSameListRequest = (visit: { method: string; url: URL }) => visit.method === 'get' && visit.url.pathname === window.location.pathname;

        const removeStart = router.on('start', (event) => {
            if (isSameListRequest(event.detail.visit)) setIsLoading(true);
        });
        const removeFinish = router.on('finish', (event) => {
            if (isSameListRequest(event.detail.visit)) setIsLoading(false);
        });

        return () => {
            removeStart();
            removeFinish();
        };
    }, []);

    return isLoading;
}
