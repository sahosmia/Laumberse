import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { permission } from '@/constants/permissions';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { CalendarClock, FilePlus, Package, Plus, Receipt, UserCog, Users } from 'lucide-react';

const QUICK_ACTIONS = [
    {
        title: 'Create Invoice',
        icon: FilePlus,
        href: () => route('create-invoice'),
        permission: permission('invoices', 'create'),
    },
    {
        title: 'Add Client',
        icon: Users,
        href: () => route('clients.index', { action: 'create' }),
        permission: permission('clients', 'create'),
    },
    {
        title: 'Add Meeting',
        icon: CalendarClock,
        href: () => route('meetings.index', { action: 'add-meeting' }),
        permission: permission('clients', 'edit'),
    },
    {
        title: 'Add Follow-up',
        icon: CalendarClock,
        href: () => route('meetings.index', { action: 'add-follow-up' }),
        permission: permission('clients', 'edit'),
    },
    {
        title: 'Add Product',
        icon: Package,
        href: () => route('products.index', { action: 'create' }),
        permission: permission('catalog', 'create'),
    },
    {
        title: 'Add Expense',
        icon: Receipt,
        href: () => route('expenses.index', { action: 'create' }),
        permission: permission('expenses', 'create'),
    },
    {
        title: 'Add Employee',
        icon: UserCog,
        href: () => route('employees.index', { action: 'create' }),
        permission: permission('employees', 'create'),
    },
];

export function QuickActions() {
    const { auth } = usePage<SharedData>().props;
    const actions = QUICK_ACTIONS.filter((action) => auth.permissions.includes(action.permission));

    if (actions.length === 0) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm transition-colors hover:bg-blue-700"
                    title="Quick create"
                >
                    <Plus className="h-4 w-4" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Quick Create</DropdownMenuLabel>
                {actions.map((action) => (
                    <DropdownMenuItem key={action.title} asChild>
                        <Link href={action.href()} className="cursor-pointer">
                            <action.icon className="mr-2 h-4 w-4" /> {action.title}
                        </Link>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
