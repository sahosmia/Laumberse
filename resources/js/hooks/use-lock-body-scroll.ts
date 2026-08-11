import { useEffect } from 'react';

/** Locks page scroll while `locked` is true (e.g. a modal is open). Restores on unmount. */
export function useLockBodyScroll(locked: boolean) {
    useEffect(() => {
        if (locked) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        };
    }, [locked]);
}
