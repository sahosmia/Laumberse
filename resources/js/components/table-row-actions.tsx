import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Link, router } from '@inertiajs/react';
import { Eye, MoreHorizontal, SquarePen, Trash2 } from 'lucide-react';
import { useState, type ReactNode } from 'react';

type RowAction = { href: string; label?: string } | { onClick: () => void; label?: string };

interface TableRowActionsProps {
    /** Route name passed to route(deleteRoute, id), e.g. 'clients.destroy'. Omit to hide delete. */
    deleteRoute?: string;
    /** Id passed to the delete route. Required when deleteRoute is set. Pass an array (in URI order) for a route with more than one wildcard, e.g. clients.activities.destroy needs [clientId, activityId]. */
    id?: number | string | (number | string)[];
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
        router.delete(route(deleteRoute, id as never), {
            onSuccess: () => setShowDeleteModal(false),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" aria-label="More actions" className="min-h-10 min-w-10 p-0 md:h-8 md:min-h-8 md:w-8 md:min-w-8">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                    {view && <ActionItem action={{ label: 'View Details', ...view }} icon={<Eye className="mr-2 h-4 w-4" />} />}
                    {edit && <ActionItem action={{ label: 'Edit', ...edit }} icon={<SquarePen className="mr-2 h-4 w-4" />} />}

                    {customActions}

                    {deleteRoute && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onSelect={(e) => {
                                    e.preventDefault();
                                    setShowDeleteModal(true);
                                }}
                                className="cursor-pointer text-red-600 focus:text-red-600"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
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
