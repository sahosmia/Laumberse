import * as React from 'react';
import { cn } from '@/lib/utils';
import { Input } from './input';
import { FormLabel } from './form-label';
import { FormError } from './form-error';

interface FormInputProps extends Omit<React.ComponentProps<'input'>, 'size'> {
    label?: string;
    required?: boolean;
    error?: string;
    helperText?: string;
    containerClassName?: string;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
    ({ label, required, error, helperText, containerClassName, className, type = 'text', id, ...props }, ref) => {
        const generatedId = React.useId();
        const inputId = id || generatedId;

        return (
            <div className={cn('flex flex-col gap-1.5 w-full', containerClassName)}>
                {label && (
                    <FormLabel htmlFor={inputId} required={required}>
                        {label}
                    </FormLabel>
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
                <FormError message={error} />
            </div>
        );
    }
);

FormInput.displayName = 'FormInput';
