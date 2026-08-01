import * as React from 'react';
import { cn } from '@/lib/utils';

interface FormErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {
    message?: string;
}

export const FormError: React.FC<FormErrorProps> = ({ message, className, ...props }) => {
    if (!message) return null;
    return (
        <p
            className={cn('text-xs text-red-500 dark:text-red-400 font-medium transition-all duration-200 ease-in-out', className)}
            {...props}
        >
            {message}
        </p>
    );
};

FormError.displayName = 'FormError';
