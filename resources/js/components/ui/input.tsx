import * as React from 'react';

import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(({ className, type, onWheel, ...props }, ref) => {
    return (
        <input
            type={type}
            className={cn(
                'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                className,
            )}
            ref={ref}
            // Prevent the browser's default number-input behavior of changing the value
            // on mouse-wheel scroll, which can silently corrupt values (price, qty, paid, etc.)
            // when the user scrolls the page while the field happens to be focused.
            onWheel={type === 'number' ? (e) => { e.currentTarget.blur(); onWheel?.(e); } : onWheel}
            {...props}
        />
    );
});

Input.displayName = 'Input';

export { Input };
