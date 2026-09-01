import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check, Minus } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>>(
    ({ className, ...props }, ref) => (
        <CheckboxPrimitive.Root
            ref={ref}
            className={cn(
                'peer group size-5 shrink-0 rounded-md border-2 border-neutral-300 bg-white shadow-sm transition-all duration-150 outline-none',
                'hover:border-blue-400 hover:shadow-md',
                'focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2',
                'data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:hover:border-blue-700 data-[state=checked]:hover:bg-blue-700',
                'data-[state=indeterminate]:border-blue-600 data-[state=indeterminate]:bg-blue-600',
                'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-neutral-300 disabled:hover:shadow-sm',
                'dark:border-neutral-600 dark:bg-neutral-900 dark:hover:border-blue-500',
                'dark:data-[state=checked]:border-blue-500 dark:data-[state=checked]:bg-blue-500',
                'dark:data-[state=indeterminate]:border-blue-500 dark:data-[state=indeterminate]:bg-blue-500',
                className,
            )}
            {...props}
        >
            <CheckboxPrimitive.Indicator
                className={cn(
                    'flex items-center justify-center text-white duration-150',
                    'data-[state=checked]:animate-in data-[state=checked]:zoom-in-50',
                )}
            >
                {props.checked === 'indeterminate' ? <Minus className="size-3.5 stroke-3" /> : <Check className="size-3.5 stroke-3" />}
            </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
    ),
);
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
