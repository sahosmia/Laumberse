import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { type NavGroup, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';

/**
 * Ziggy's route() returns an absolute URL (http://host/products) by default,
 * while Inertia's usePage().url is always relative (/products) — strip the
 * origin so both sides compare on equal footing.
 */
function toPath(url: string): string {
    return url.replace(/^https?:\/\/[^/]+/, '');
}

/**
 * Matches an item's URL against the current page URL. Items without a query
 * string (the common case) match on pathname alone, so a link like `/products`
 * stays active while the user has a `?search=` or `?page=` filter applied.
 * An item that does carry its own query string requires an exact match.
 */
function isItemActive(itemUrl: string, currentUrl: string): boolean {
    const itemPath = toPath(itemUrl);
    const currentPath = toPath(currentUrl);
    const [itemPathname, itemQuery] = itemPath.split('?');
    if (itemQuery) {
        return itemPath === currentPath;
    }
    return itemPathname === currentPath.split('?')[0];
}

function NavItemRow({ item, onLinkClick }: { item: NavItem; onLinkClick: () => void }) {
    const page = usePage();

    // A group with only one destination doesn't need a dropdown — link straight
    // to that destination instead, keeping the parent's own title/icon.
    const subItems = item.items && item.items.length > 1 ? item.items : undefined;
    const directUrl = item.items && item.items.length === 1 ? item.items[0].url : item.url;

    if (subItems) {
        const isActive = isItemActive(item.url, page.url) || subItems.some((subItem) => isItemActive(subItem.url, page.url));

        return (
            <Collapsible key={item.title} asChild defaultOpen={isActive} className="group/collapsible">
                <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={item.title} isActive={isActive}>
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                        <SidebarMenuSub>
                            {subItems.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.title}>
                                    <SidebarMenuSubButton asChild isActive={isItemActive(subItem.url, page.url)}>
                                        <Link href={subItem.url} onClick={onLinkClick}>
                                            <span>{subItem.title}</span>
                                        </Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                            ))}
                        </SidebarMenuSub>
                    </CollapsibleContent>
                </SidebarMenuItem>
            </Collapsible>
        );
    }

    return (
        <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild isActive={isItemActive(directUrl, page.url)}>
                <Link href={directUrl} prefetch onClick={onLinkClick}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

export function NavMain({ groups }: { groups: NavGroup[] }) {
    const { setOpenMobile, isMobile } = useSidebar();

    const handleLinkClick = () => {
        if (isMobile) {
            setOpenMobile(false);
        }
    };

    return (
        <>
            {groups.map((group) => (
                <SidebarGroup key={group.title} className="px-2 py-0">
                    <SidebarMenu>
                        {group.items.map((item) => (
                            <NavItemRow key={item.title} item={item} onLinkClick={handleLinkClick} />
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </>
    );
}
