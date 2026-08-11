import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

const SIZE_CLASSES = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
} as const;

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    size?: keyof typeof SIZE_CLASSES;
    children: React.ReactNode;
}

/** Shared CRUD create/edit modal matching the app's house look, built on Radix Dialog (handles scroll-lock, focus-trap, backdrop/Escape-to-close). */
export function Modal({ isOpen, onClose, title, size = 'md', children }: ModalProps) {
    return (
        <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <DialogPrimitive.Content
                    className={cn(
                        'fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white dark:bg-neutral-900 shadow-2xl max-h-[90vh] overflow-y-auto p-6 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
                        SIZE_CLASSES[size],
                    )}
                >
                    <div className="flex justify-between items-center mb-6">
                        <DialogPrimitive.Title className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                            {title}
                        </DialogPrimitive.Title>
                        <DialogPrimitive.Close className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg min-h-12 min-w-12 flex items-center justify-center">
                            <X className="w-5 h-5 text-gray-400" />
                        </DialogPrimitive.Close>
                    </div>
                    {children}
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}
