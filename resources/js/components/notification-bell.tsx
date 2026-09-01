import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatDateTime } from '@/lib/format';
import { type AppNotification, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export function NotificationBell() {
    const { notifications } = usePage<SharedData>().props;
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [items, setItems] = useState<AppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(notifications.unread_count);

    // The badge count comes from the Inertia-shared prop (fresh on every page visit); once the
    // dropdown has fetched its own list, unread actions inside it keep the local count in sync
    // without waiting for the next navigation.
    useEffect(() => {
        if (!loaded) setUnreadCount(notifications.unread_count);
    }, [notifications.unread_count, loaded]);

    const fetchNotifications = () => {
        setLoading(true);
        axios
            .get<{ notifications: AppNotification[]; unread_count: number }>(route('notifications.index'))
            .then((res) => {
                setItems(res.data.notifications);
                setUnreadCount(res.data.unread_count);
                setLoaded(true);
            })
            .finally(() => setLoading(false));
    };

    const handleOpenChange = (next: boolean) => {
        setOpen(next);
        if (next && !loaded) {
            fetchNotifications();
        }
    };

    const markRead = (notification: AppNotification) => {
        if (notification.read_at) return;
        axios.post(route('notifications.read', notification.id));
        setItems((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n)));
        setUnreadCount((count) => Math.max(0, count - 1));
    };

    const markAllRead = () => {
        axios.post(route('notifications.read-all'));
        setItems((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
        setUnreadCount(0);
    };

    return (
        <DropdownMenu open={open} onOpenChange={handleOpenChange}>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    title="Notifications"
                    className="relative flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                >
                    <Bell className="h-[18px] w-[18px]" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-4 min-w-4 items-center justify-center rounded-full border-0 px-1 text-[10px] leading-none"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="flex max-h-[70dvh] w-[calc(100vw-2rem)] flex-col overflow-hidden p-0 sm:w-96">
                <div className="flex shrink-0 items-center justify-between border-b border-neutral-100 px-4 py-2.5 dark:border-neutral-800">
                    <p className="text-xs font-bold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">Notifications</p>
                    {unreadCount > 0 && (
                        <button
                            type="button"
                            onClick={markAllRead}
                            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                            <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                        </button>
                    )}
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto">
                    {loading && (
                        <div className="flex items-center justify-center py-10">
                            <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
                        </div>
                    )}
                    {!loading && loaded && items.length === 0 && (
                        <p className="px-4 py-10 text-center text-xs text-neutral-400 italic">No notifications yet</p>
                    )}
                    {!loading &&
                        items.map((notification) => {
                            const content = (
                                <>
                                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{notification.title}</p>
                                    <p className="mt-0.5 text-xs break-words whitespace-normal text-neutral-500 dark:text-neutral-400">
                                        {notification.message}
                                    </p>
                                    <p className="mt-1 text-[10px] text-neutral-400">{formatDateTime(notification.created_at)}</p>
                                </>
                            );

                            const rowClass = `block border-b border-neutral-50 px-4 py-3 transition-colors last:border-b-0 hover:bg-neutral-50 dark:border-neutral-800/50 dark:hover:bg-neutral-800/50 ${
                                !notification.read_at ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                            }`;

                            return notification.url ? (
                                <Link key={notification.id} href={notification.url} onClick={() => markRead(notification)} className={rowClass}>
                                    {content}
                                </Link>
                            ) : (
                                <button
                                    key={notification.id}
                                    type="button"
                                    onClick={() => markRead(notification)}
                                    className={`w-full text-left ${rowClass}`}
                                >
                                    {content}
                                </button>
                            );
                        })}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
