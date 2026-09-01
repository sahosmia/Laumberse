import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

const SIZE_CLASSES = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
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
                {/*
                  Centered via flexbox, not `left-1/2 top-1/2 -translate-1/2`: a persistent
                  CSS transform on the dialog breaks native HTML5 validation-bubble
                  positioning in Chromium (the "please fill this field" popup renders
                  off-screen), which made required <select>s inside modals silently
                  block submission with no visible feedback.
                */}
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/*
                      max-h subtracts this wrapper's own p-4 (2rem vertical) from the dynamic
                      viewport height — without that, a modal that actually needs the full
                      90dvh plus this padding overflows the fixed positioning container on both
                      sides at once (flexbox doesn't clip an over-tall centered child), pushing
                      the header above the visible area and the Save/Cancel row below it with no
                      way to scroll back to either, since only the content below is scrollable.
                      This is what made the Meeting/Reminder form's action buttons unreachable on
                      iPhone Safari specifically — its shorter effective viewport (browser chrome
                      + keyboard) hits this overflow far more often than Android/desktop do.
                      pb- adds the safe-area inset on top of the existing bottom padding so the
                      last field/button never sits flush against the home-indicator area.
                    */}
                    <DialogPrimitive.Content
                        className={cn(
                            'w-full rounded-2xl bg-white dark:bg-neutral-900 shadow-2xl max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
                            SIZE_CLASSES[size],
                        )}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <DialogPrimitive.Title className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                                {title}
                            </DialogPrimitive.Title>
                            <DialogPrimitive.Close className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg min-h-12 min-w-12 flex items-center justify-center">
                                <X className="w-5 h-5 text-gray-400" />
                                <span className="sr-only">Close</span>
                            </DialogPrimitive.Close>
                        </div>
                        {children}
                    </DialogPrimitive.Content>
                </div>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}
