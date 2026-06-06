import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast, Toaster } from 'sonner';

export function FlashMessage() {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;

    useEffect(() => {
        if (flash.success) {
            toast.success(flash.success);
        }
        if (flash.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    return <Toaster position="top-right" richColors />;
}
