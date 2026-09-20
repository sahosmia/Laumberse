import { FlashMessage } from '@/components/flash-message';
import { OutletSwitcher } from '@/components/outlet-switcher';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';

interface AppLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
        <FlashMessage />
        <OutletSwitcher />
        {children}
    </AppLayoutTemplate>
);
