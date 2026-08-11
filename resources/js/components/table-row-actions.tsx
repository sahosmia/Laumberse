import { Link, router } from '@inertiajs/react';
import { Eye, SquarePen, Trash2, MoreHorizontal } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';

type RowAction = { href: string; label?: string } | { onClick: () => void; label?: string };

interface TableRowActionsProps {
    /** Route name passed to route(deleteRoute, id), e.g. 'clients.destroy'. Omit to hide delete. */
    deleteRoute?: string;
    /** Id passed to the delete route. Required when deleteRoute is set. */
    id?: number | string;
    /** Display name used in the delete confirmation copy, e.g. the client's name. */
    label?: string;
    view?: RowAction;
    edit?: RowAction;
    /** Extra menu items rendered between Edit and the delete separator (e.g. "Print", "Resend"). */
    customActions?: ReactNode;
}

function ActionItem({ action, icon }: { action: RowAction; icon: ReactNode }) {
    if ('href' in action) {
        return (
            <DropdownMenuItem asChild>
                <Link href={action.href}>
                    {icon} {action.label}
                </Link>
            </DropdownMenuItem>
        );
    }
    return (
        <DropdownMenuItem onSelect={action.onClick}>
            {icon} {action.label}
        </DropdownMenuItem>
    );
}

export function TableRowActions({ deleteRoute, id, label = 'item', view, edit, customActions }: TableRowActionsProps) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [processing, setProcessing] = useState(false);

    const confirmDelete = () => {
        if (!deleteRoute || id === undefined) return;
        setProcessing(true);
        router.delete(route(deleteRoute, id), {
            onSuccess: () => setShowDeleteModal(false),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="w-8 h-8 p-0">
                        <MoreHorizontal className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                    {view && <ActionItem action={{ label: 'View Details', ...view }} icon={<Eye className="w-4 h-4 mr-2" />} />}
                    {edit && <ActionItem action={{ label: 'Edit', ...edit }} icon={<SquarePen className="w-4 h-4 mr-2" />} />}

                    {customActions}

                    {deleteRoute && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onSelect={(e) => {
                                    e.preventDefault();
                                    setShowDeleteModal(true);
                                }}
                                className="text-red-600 focus:text-red-600 cursor-pointer"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                <span>Delete</span>
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {deleteRoute && (
                <DeleteConfirmationModal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={confirmDelete}
                    title={`Delete ${label}?`}
                    description={`This action cannot be undone. This will permanently delete ${label}.`}
                    isProcessing={processing}
                />
            )}
        </>
    );
}
