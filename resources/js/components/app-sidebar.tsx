import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavGroup } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Home, FilePlus, Clock, Users, UserCog, BarChart3, Package, Receipt, Wallet } from 'lucide-react';
import AppLogo from './app-logo';

const navGroups: NavGroup[] = [
    {
        title: 'Overview',
        items: [
            {
                title: 'Dashboard',
                url: route('dashboard'),
                icon: Home,
            },
            {
                title: 'Create Invoice',
                url: route('create-invoice'),
                icon: FilePlus,
            },
            {
                title: 'Invoice History',
                url: route('history'),
                icon: Clock,
            },
            {
                title: 'Clients',
                url: route('clients.index'),
                icon: Users,
            },

            {
                title: 'Employees',
                url: route('employees.index'),
                icon: UserCog,
            },
            {
                title: 'Payroll Ledger',
                url: route('payrolls.index'),
                icon: BookOpen,
            },

            {
                title: 'Products',
                url: '#',
                icon: Package,
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
            {
                title: 'Expenses',
                url: '#',
                icon: Receipt,
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
                items: [
                    {
                        title: 'All Assets',
                        url: route('manage-assets.index'),
                    },
                    {
                        title: 'Categories',
                        url: route('asset-categories.index'),
                    },
                ],
            },
      
            {
                title: 'Reports',
                url: route('reports'),
                icon: BarChart3,
            },
        ],
    },
];

export function AppSidebar() {
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
