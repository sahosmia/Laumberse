import { type SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { Check, Store } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

/**
 * Ctrl+Space outlet switcher — an Alt-Tab-style app switcher for the active outlet. Hold Ctrl,
 * tap Space to cycle through `outlet.available` (+ "All Outlets"), release Ctrl to confirm. Only
 * armed for a user who holds outlets.switch (see OutletSelector — the click/dropdown equivalent
 * of this same server-resolved outlet.available list).
 *
 * A literal Alt+Tab can't be used for this: Windows intercepts it at the OS level for its own
 * window switcher before it ever reaches the browser, so no web page can listen for it.
 */
export function OutletSwitcher() {
    const { outlet } = usePage<SharedData>().props;
    const [isOpen, setIsOpen] = useState(false);
    const [index, setIndex] = useState(0);

    // Refs so the window-level listeners (registered once) always read the latest state — state
    // updates inside a fast keydown/keydown/keyup burst can otherwise still be mid-flight when the
    // next event fires.
    const indexRef = useRef(0);
    const isOpenRef = useRef(false);
    indexRef.current = index;
    isOpenRef.current = isOpen;

    const canSwitch = !!outlet?.canSwitch;
    const options = outlet ? [{ id: 'all', label: 'All Outlets' }, ...outlet.available.map((o) => ({ id: String(o.id), label: o.name }))] : [];
    const optionsRef = useRef(options);
    optionsRef.current = options;

    useEffect(() => {
        if (!canSwitch) return;

        const startIndex = () => {
            const currentId = outlet?.isAll ? 'all' : String(outlet?.current?.id ?? '');
            const i = optionsRef.current.findIndex((o) => o.id === currentId);
            return i === -1 ? 0 : i;
        };

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.code !== 'Space' || !e.ctrlKey || e.altKey || e.metaKey || e.repeat) return;
            e.preventDefault();

            if (!isOpenRef.current) {
                isOpenRef.current = true;
                setIndex(startIndex());
                setIsOpen(true);
            } else {
                setIndex((i) => (i + 1) % optionsRef.current.length);
            }
        };

        const onKeyUp = (e: KeyboardEvent) => {
            if (e.key !== 'Control' || !isOpenRef.current) return;

            isOpenRef.current = false;
            setIsOpen(false);
            const chosen = optionsRef.current[indexRef.current];
            if (chosen) {
                router.post(route('outlet-context.update'), { outlet: chosen.id }, { preserveScroll: true });
            }
        };

        const onEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpenRef.current) {
                isOpenRef.current = false;
                setIsOpen(false);
            }
        };

        // If the window loses focus mid-hold (e.g. a real OS Alt-Tab happens while Ctrl is still
        // down), cancel — there is no reliable way to still catch the Ctrl release on this page.
        const onBlur = () => {
            if (isOpenRef.current) {
                isOpenRef.current = false;
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keydown', onEscape);
        window.addEventListener('keyup', onKeyUp);
        window.addEventListener('blur', onBlur);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keydown', onEscape);
            window.removeEventListener('keyup', onKeyUp);
            window.removeEventListener('blur', onBlur);
        };
        // Deliberately scoped to just the fields that matter, not the whole `outlet` object — it's
        // a fresh reference on every Inertia page visit, and re-running this would tear down and
        // rebuild the listeners (and could drop an in-progress hold) on every navigation.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canSwitch, outlet?.isAll, outlet?.current?.id]);

    if (!isOpen || !canSwitch) return null;

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="flex max-w-[90vw] gap-2 overflow-x-auto rounded-2xl bg-white p-4 shadow-2xl dark:bg-neutral-900">
                {options.map((o, i) => (
                    <div
                        key={o.id}
                        className={`flex w-28 shrink-0 flex-col items-center gap-2 rounded-xl p-3 transition-all ${
                            i === index ? 'scale-105 bg-blue-600 text-white shadow-lg' : 'text-neutral-500 dark:text-neutral-400'
                        }`}
                    >
                        <Store className={`h-6 w-6 ${i === index ? 'text-white' : 'text-neutral-400'}`} />
                        <span className="truncate text-center text-xs font-medium">{o.label}</span>
                        {i === index && <Check className="h-3.5 w-3.5" />}
                    </div>
                ))}
            </div>
            <p className="mt-4 text-xs text-white/70">Hold Ctrl, tap Space to cycle — release Ctrl to switch</p>
        </div>
    );
}
