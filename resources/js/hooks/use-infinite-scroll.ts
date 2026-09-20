import { useCallback, useEffect, useRef, useState } from 'react';

interface UseInfiniteScrollOptions {
    hasMore: boolean;
    loading: boolean;
    onLoadMore: () => void;
    /** How far before the sentinel enters the viewport to fire the load — lets the next page arrive before the user hits the true bottom. */
    rootMargin?: string;
}

/**
 * Returns a ref callback to attach to a sentinel element placed after a list. Calls
 * `onLoadMore` once each time that sentinel scrolls into view, as long as `hasMore` is true
 * and nothing is already `loading` — drives DataView's infinite scroll instead of pagination links.
 */
export function useInfiniteScroll<T extends HTMLElement>({ hasMore, loading, onLoadMore, rootMargin = '200px' }: UseInfiniteScrollOptions) {
    const [node, setNode] = useState<T | null>(null);
    const sentinelRef = useCallback((el: T | null) => setNode(el), []);

    // Read the latest flags/callback from inside the observer without re-creating it on every render.
    const stateRef = useRef({ hasMore, loading, onLoadMore });
    stateRef.current = { hasMore, loading, onLoadMore };

    useEffect(() => {
        if (!node) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && stateRef.current.hasMore && !stateRef.current.loading) {
                    stateRef.current.onLoadMore();
                }
            },
            { rootMargin },
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [node, rootMargin]);

    return sentinelRef;
}
