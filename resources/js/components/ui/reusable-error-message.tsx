import * as React from 'react';
import { cn } from '@/lib/utils';

interface ReusableErrorMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
    message?: string;
}

export const ReusableErrorMessage: React.FC<ReusableErrorMessageProps> = ({ message, className, ...props }) => {
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

ReusableErrorMessage.displayName = 'ReusableErrorMessage';
