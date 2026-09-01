import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import * as React from 'react';
import { FormError } from './form-error';
import { FormLabel } from './form-label';

interface FormSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
    label?: string;
    required?: boolean;
    error?: string;
    helperText?: string;
    containerClassName?: string;
    /** Small leading icon (e.g. a calendar, a tag) — purely visual, matches FilterSelect's look. */
    icon?: React.ReactNode;
}

/**
 * Standard form `<select>` — same restyled look as FilterSelect (rounded border, chevron,
 * optional leading icon) but with FormInput-style label/required-mark/error/helperText, for use
 * in create/edit forms rather than list-page filter bars.
 */
export const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
    ({ label, required, error, helperText, containerClassName, className, icon, id, children, ...props }, ref) => {
        const generatedId = React.useId();
        const selectId = id || generatedId;

        return (
            <div className={cn('flex w-full flex-col gap-1.5', containerClassName)}>
                {label && (
                    <FormLabel htmlFor={selectId} required={required}>
                        {label}
                    </FormLabel>
                )}
                <div className="relative">
                    {icon && <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-neutral-400">{icon}</span>}
                    <select
                        ref={ref}
                        id={selectId}
                        className={cn(
                            'h-12 w-full appearance-none rounded-xl border border-neutral-200 bg-transparent px-3 pr-9 text-sm transition-all focus:ring-2 focus:ring-blue-500/30 focus:outline-none md:h-10 dark:border-neutral-800 dark:text-neutral-100',
                            icon && 'pl-9',
                            error && 'border-red-500 focus:ring-red-500/30',
                            className,
                        )}
                        {...props}
                    >
                        {children}
                    </select>
                    <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                </div>
                {helperText && !error && <p className="text-xs text-neutral-500 dark:text-neutral-400">{helperText}</p>}
                <FormError message={error} />
            </div>
        );
    },
);
FormSelect.displayName = 'FormSelect';
