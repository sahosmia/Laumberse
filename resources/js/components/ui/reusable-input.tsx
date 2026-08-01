import * as React from 'react';
import { cn } from '@/lib/utils';
import { Input } from './input';
import { ReusableLabel } from './reusable-label';
import { ReusableErrorMessage } from './reusable-error-message';

interface ReusableInputProps extends Omit<React.ComponentProps<'input'>, 'size'> {
    label?: string;
    required?: boolean;
    error?: string;
    helperText?: string;
    containerClassName?: string;
}

export const ReusableInput = React.forwardRef<HTMLInputElement, ReusableInputProps>(
    ({ label, required, error, helperText, containerClassName, className, type = 'text', id, ...props }, ref) => {
        const generatedId = React.useId();
        const inputId = id || generatedId;

        return (
            <div className={cn('flex flex-col gap-1.5 w-full', containerClassName)}>
                {label && (
                    <ReusableLabel htmlFor={inputId} required={required}>
                        {label}
                    </ReusableLabel>
                )}
                <Input
                    ref={ref}
                    type={type}
                    id={inputId}
                    className={cn(
                        error && 'border-red-500 focus-visible:ring-red-500',
                        className
                    )}
                    {...props}
                />
                {helperText && !error && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{helperText}</p>
                )}
                <ReusableErrorMessage message={error} />
            </div>
        );
    }
);

ReusableInput.displayName = 'ReusableInput';
