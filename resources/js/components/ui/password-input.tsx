import { Eye, EyeOff } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';
import { FormError } from './form-error';
import { FormLabel } from './form-label';
import { Input } from './input';

interface PasswordInputProps extends Omit<React.ComponentProps<'input'>, 'type' | 'size'> {
    label?: string;
    required?: boolean;
    error?: string;
    containerClassName?: string;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
    ({ label, required, error, containerClassName, className, id, ...props }, ref) => {
        const [visible, setVisible] = React.useState(false);
        const generatedId = React.useId();
        const inputId = id || generatedId;

        return (
            <div className={cn('flex w-full flex-col gap-1.5', containerClassName)}>
                {label && (
                    <FormLabel htmlFor={inputId} required={required}>
                        {label}
                    </FormLabel>
                )}
                <div className="relative">
                    <Input
                        ref={ref}
                        type={visible ? 'text' : 'password'}
                        id={inputId}
                        className={cn(
                            'pr-10',
                            error && 'border-red-500 focus-visible:ring-red-500 focus-visible:ring-offset-0',
                            className,
                        )}
                        {...props}
                    />
                    <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setVisible((v) => !v)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-300"
                        aria-label={visible ? 'Hide password' : 'Show password'}
                    >
                        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
                <FormError message={error} />
            </div>
        );
    },
);

PasswordInput.displayName = 'PasswordInput';
