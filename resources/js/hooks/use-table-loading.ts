import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

/**
 * Tracks whether the current page's list is being refreshed — a debounced
 * search typing, a filter change, or a pagination click all issue a GET
 * request back to the same URL path. Scoping to GET + same pathname keeps
 * this from lighting up for unrelated requests on the page (modal
 * create/update/delete, bulk actions), which use other methods or paths.
 * Partial reloads (`only: [...]`) are excluded too — that's what DataView's
 * infinite-scroll "load more" uses, and it has its own loadingMore indicator;
 * without this it would replace the already-loaded rows with a full skeleton.
 */
export function useTableLoading() {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const isSameListRequest = (visit: { method: string; url: URL; only?: string[] }) =>
            visit.method === 'get' && visit.url.pathname === window.location.pathname && !visit.only?.length;

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
