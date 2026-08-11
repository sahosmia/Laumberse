import { router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PaginationLink } from '@/types/pagination';

interface PaginationProps {
    links: PaginationLink[];
    className?: string;
}

function decodeLabel(label: string) {
    return label.replace('&laquo;', '«').replace('&raquo;', '»');
}

export function Pagination({ links, className }: PaginationProps) {
    if (links.length <= 3) return null;

    const visit = (url: string | null) => {
        if (!url) return;
        router.get(url, {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    return (
        <nav className={cn('flex items-center justify-center gap-1 flex-wrap', className)}>
            {links.map((link, idx) => {
                const label = decodeLabel(link.label);
                const isPrev = idx === 0;
                const isNext = idx === links.length - 1;

                if (isPrev || isNext) {
                    return (
                        <button
                            key={idx}
                            type="button"
                            disabled={!link.url}
                            onClick={() => visit(link.url)}
                            className={cn(
                                'inline-flex items-center justify-center w-9 h-9 rounded-lg border text-sm transition-colors',
                                'border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400',
                                link.url ? 'hover:bg-neutral-100 dark:hover:bg-neutral-800' : 'opacity-40 cursor-not-allowed',
                            )}
                            aria-label={isPrev ? 'Previous page' : 'Next page'}
                        >
                            {isPrev ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                    );
                }

                if (label === '...') {
                    return (
                        <span key={idx} className="w-9 h-9 inline-flex items-center justify-center text-sm text-neutral-400">
                            …
                        </span>
                    );
                }

                return (
                    <button
                        key={idx}
                        type="button"
                        disabled={!link.url}
                        onClick={() => visit(link.url)}
                        className={cn(
                            'inline-flex items-center justify-center min-w-9 h-9 px-2 rounded-lg border text-sm font-medium transition-colors',
                            link.active
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800',
                        )}
                    >
                        {label}
                    </button>
                );
            })}
        </nav>
    );
}
