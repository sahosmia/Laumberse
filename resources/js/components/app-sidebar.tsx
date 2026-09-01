import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { PERMISSION_MODULES, permission } from '@/constants/permissions';
import { type NavGroup, type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    CalendarClock,
    Clock,
    FilePlus,
    Home,
    Landmark,
    Package,
    Receipt,
    Settings,
    Shield,
    StickyNote,
    Store,
    UserCog,
    Users,
    Wallet,
} from 'lucide-react';
import AppLogo from './app-logo';

type PermissionedNavItem = Omit<NavItem, 'items'> & {
    /** Permission required to see this item. Omit for items every logged-in staff member should see (e.g. Dashboard). */
    permission?: string;
    items?: PermissionedNavItem[];
};

type PermissionedNavGroup = {
    title: string;
    items: PermissionedNavItem[];
};

const rawNavGroups: PermissionedNavGroup[] = [
    {
        title: 'Overview',
        items: [
            {
                title: 'Dashboard',
                url: route('dashboard'),
                icon: Home,
            },
            {
                title: 'Reports',
                url: route('reports'),
                icon: BarChart3,
                permission: permission(PERMISSION_MODULES.REPORTS, 'view'),
            },
        ],
    },
    {
        title: 'Sales',
        items: [
            {
                title: 'Create Invoice',
                url: route('create-invoice'),
                icon: FilePlus,
                permission: permission(PERMISSION_MODULES.INVOICES, 'create'),
            },
            {
                title: 'Invoice History',
                url: route('history'),
                icon: Clock,
                permission: permission(PERMISSION_MODULES.INVOICES, 'view'),
            },
            {
                title: 'Clients',
                url: route('clients.index'),
                icon: Users,
                permission: permission(PERMISSION_MODULES.CLIENTS, 'view'),
            },
            {
                title: 'Meetings & Follow-ups',
                url: route('meetings.index'),
                icon: CalendarClock,
                permission: permission(PERMISSION_MODULES.CLIENTS, 'view'),
            },
        ],
    },
    {
        title: 'Catalog',
        items: [
            {
                title: 'Products',
                url: '#',
                icon: Package,
                permission: permission(PERMISSION_MODULES.CATALOG, 'view'),
                items: [
                    {
                        title: 'All Products',
                        url: route('products.index'),
                    },
                    {
                        title: 'Categories',
                        url: route('categories.index'),
                    },
                    {
                        title: 'Units',
                        url: route('units.index'),
                    },
                ],
            },
        ],
    },
    {
        title: 'Team',
        items: [
            {
                title: 'Employees',
                url: route('employees.index'),
                icon: UserCog,
                permission: permission(PERMISSION_MODULES.EMPLOYEES, 'view'),
            },
        ],
    },
    {
        title: 'Finance',
        items: [
            {
                title: 'Expenses',
                url: '#',
                icon: Receipt,
                permission: permission(PERMISSION_MODULES.EXPENSES, 'view'),
                items: [
                    {
                        title: 'All Expenses',
                        url: route('expenses.index'),
                    },
                    {
                        title: 'Categories',
                        url: route('expense-categories.index'),
                    },
                    {
                        title: 'Materials List',
                        url: route('materials.index'),
                    },
                ],
            },
            {
                title: 'Assets',
                url: '#',
                icon: Wallet,
                permission: permission(PERMISSION_MODULES.ASSETS, 'view'),
                items: [
                    {
                        title: 'All Assets',
                        url: route('assets.index'),
                    },
                    {
                        title: 'Categories',
                        url: route('asset-categories.index'),
                    },
                ],
            },
            {
                title: 'Accounting',
                url: '#',
                icon: Landmark,
                items: [
                    {
                        title: 'Accounts',
                        url: route('accounts.index'),
                        permission: permission(PERMISSION_MODULES.ACCOUNTS, 'view'),
                    },
                    {
                        title: 'Financial Position',
                        url: route('accounts.financial-position'),
                        permission: permission(PERMISSION_MODULES.ACCOUNTS, 'view'),
                    },
                    {
                        title: 'Investors',
                        url: route('investors.index'),
                        permission: permission(PERMISSION_MODULES.INVESTOR_LOANS, 'view'),
                    },
                    {
                        title: 'Company Loans',
                        url: route('company-loans.index'),
                        permission: permission(PERMISSION_MODULES.INVESTOR_LOANS, 'view'),
                    },
                ],
            },
        ],
    },
    {
        title: 'Administration',
        items: [
            {
                title: 'Notes',
                url: '#',
                icon: StickyNote,
                permission: permission(PERMISSION_MODULES.NOTES, 'view'),
                items: [
                    {
                        title: 'All Notes',
                        url: route('notes.index'),
                    },
                    {
                        title: 'Categories',
                        url: route('note-categories.index'),
                    },
                ],
            },
            {
                title: 'Outlets',
                url: route('outlets.index'),
                icon: Store,
                permission: permission(PERMISSION_MODULES.OUTLETS, 'view'),
            },
            {
                title: 'Roles & Users',
                url: '#',
                icon: Shield,
                permission: permission(PERMISSION_MODULES.ROLES, 'view'),
                items: [
                    {
                        title: 'Roles & Permissions',
                        url: route('roles.index'),
                    },
                    {
                        title: 'Staff Users',
                        url: route('users.index'),
                    },
                ],
            },
            {
                title: 'Global Settings',
                url: route('settings.global.edit'),
                icon: Settings,
                permission: permission(PERMISSION_MODULES.SETTINGS, 'view'),
            },
        ],
    },
];

function filterByPermission(items: PermissionedNavItem[], permissions: string[]): NavItem[] {
    return items
        .filter((item) => !item.permission || permissions.includes(item.permission))
        .map((item) => ({
            ...item,
            items: item.items ? filterByPermission(item.items, permissions) : undefined,
        }))
        .filter((item) => !item.items || item.items.length > 0);
}

function buildNavGroups(permissions: string[]): NavGroup[] {
    return rawNavGroups
        .map((group) => ({
            title: group.title,
            items: filterByPermission(group.items, permissions),
        }))
        .filter((group) => group.items.length > 0);
}

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const navGroups = buildNavGroups(auth.permissions);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={route('dashboard')} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain groups={navGroups} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
