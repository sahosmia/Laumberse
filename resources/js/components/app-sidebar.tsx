import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, Home, FilePlus, Clock, Users, BarChart3, Package, Tag, MapPin, Receipt, Wallet } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
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
        title: 'Outlets',
        url: route('outlets.index'),
        icon: MapPin,
    },
    {
        title: 'Clients',
        url: route('clients.index'),
        icon: Users,
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
            }
        ],
    },
    {
        title: 'Assets',
        url: route('assets.index'),
        icon: Wallet,
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
        title: 'Reports',
        url: route('reports'),
        icon: BarChart3,
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
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
