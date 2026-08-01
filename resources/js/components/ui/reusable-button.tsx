import * as React from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ReusableButtonProps extends React.ComponentPropsWithoutRef<typeof Button> {
    loading?: boolean;
    icon?: React.ReactNode;
}

export const ReusableButton = React.forwardRef<
    React.ElementRef<typeof Button>,
    ReusableButtonProps
>(({ loading, icon, className, children, disabled, variant = 'default', ...props }, ref) => {
    return (
        <Button
            ref={ref}
            disabled={disabled || loading}
            variant={variant}
            className={cn(
                'min-h-12 md:min-h-10 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2',
                variant === 'default' && 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white',
                variant === 'secondary' && 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-300',
                className
            )}
            {...props}
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                icon
            )}
            {children}
        </Button>
    );
});

ReusableButton.displayName = 'ReusableButton';
