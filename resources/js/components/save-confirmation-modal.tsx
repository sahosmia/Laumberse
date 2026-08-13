import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { HelpCircle } from 'lucide-react';

interface SaveConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    confirmText?: string;
    isProcessing?: boolean;
}

export function SaveConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Changes',
    description = 'Are you sure you want to save these changes?',
    confirmText = 'Save Changes',
    isProcessing = false,
}: SaveConfirmationModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader className="flex flex-col items-center gap-2">
                    <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/20">
                        <HelpCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <DialogTitle className="text-center text-xl font-bold">{title}</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
                </div>
                <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row">
                    <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isProcessing}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={onConfirm} className="flex-1 bg-blue-600 text-white hover:bg-blue-700" disabled={isProcessing}>
                        {isProcessing ? 'Saving...' : confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
