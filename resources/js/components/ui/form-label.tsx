import * as React from 'react';
import { Label } from './label';
import { cn } from '@/lib/utils';

interface FormLabelProps extends React.ComponentPropsWithoutRef<typeof Label> {
    required?: boolean;
}

export const FormLabel = React.forwardRef<
    React.ElementRef<typeof Label>,
    FormLabelProps
>(({ required, className, children, ...props }, ref) => {
    return (
        <Label
            ref={ref}
            className={cn('text-sm font-medium text-neutral-700 dark:text-neutral-300', className)}
            {...props}
        >
            {children}
            {required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
        </Label>
    );
});

FormLabel.displayName = 'FormLabel';
