import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

/** Dims the table/list it's absolutely positioned over and shows a centered spinner while a search/filter/pagination request is in flight. Parent needs `relative`. Pass `className="md:hidden"` when the desktop table already shows skeleton rows and only the mobile card list still needs this. */
export function TableLoadingOverlay({ show, className }: { show: boolean; className?: string }) {
    if (!show) return null;

    return (
        <div
            className={cn(
                'absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/60 duration-150 animate-in fade-in backdrop-blur-[1px] dark:bg-neutral-900/60',
                className,
            )}
        >
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
    );
}
