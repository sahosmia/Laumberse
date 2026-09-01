import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import * as React from 'react';

interface FilterSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    /** Small leading icon (e.g. a category tag, a calendar) — purely visual, mirrors the search box's icon. */
    icon?: React.ReactNode;
    containerClassName?: string;
}

/** A native `<select>` restyled with a custom icon + chevron so it matches the rest of the filter bar instead of the browser's default dropdown chrome. */
export const FilterSelect = React.forwardRef<HTMLSelectElement, FilterSelectProps>(
    ({ icon, className, containerClassName, children, ...props }, ref) => (
        <div className={cn('relative', containerClassName)}>
            {icon && <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-neutral-400">{icon}</span>}
            <select
                ref={ref}
                className={cn(
                    'w-full appearance-none rounded-xl border border-neutral-200 bg-white py-2.5 pr-9 text-sm transition-all focus:ring-2 focus:ring-blue-500/30 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100',
                    icon ? 'pl-9' : 'pl-3',
                    className,
                )}
                {...props}
            >
                {children}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        </div>
    ),
);
FilterSelect.displayName = 'FilterSelect';
