import AppLogoIcon from '@/components/app-logo-icon';
import type { SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { CalendarClock, FileText, KeyRound, LogOut, Tag } from 'lucide-react';
import { type PropsWithChildren } from 'react';

const navItems = [
    { title: 'Invoices', href: () => route('portal.invoices.index'), icon: FileText },
    { title: 'My Prices', href: () => route('portal.prices.index'), icon: Tag },
    { title: 'Meetings & Follow-ups', href: () => route('portal.activities.index'), icon: CalendarClock },
    { title: 'Change Password', href: () => route('portal.password.edit'), icon: KeyRound },
];

/** Mirrors nav-main.tsx: Ziggy's route() is absolute, Inertia's page.url is relative. */
function toPath(url: string): string {
    return url.replace(/^https?:\/\/[^/]+/, '');
}

function isNavActive(itemUrl: string, currentUrl: string): boolean {
    return toPath(itemUrl) === toPath(currentUrl).split('?')[0];
}

export default function ClientPortalLayout({ children }: PropsWithChildren) {
    const page = usePage<SharedData>();
    const client = page.props.auth.client;

    const logout = () => {
        router.post(route('portal.logout'));
    };

    return (
        <div className="min-h-svh bg-neutral-50 dark:bg-neutral-950">
            <header className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
                <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
                            <AppLogoIcon className="h-6 w-6 object-contain" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">Client Portal</p>
                            {client && <p className="text-xs text-neutral-500 dark:text-neutral-400">{client.name}</p>}
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-1.5 rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-600 transition-colors hover:text-red-600 dark:bg-neutral-800 dark:text-neutral-300"
                    >
                        <LogOut className="h-3.5 w-3.5" /> Log out
                    </button>
                </div>
                <nav className="mx-auto flex max-w-5xl gap-1 px-4">
                    {navItems.map((item) => {
                        const href = item.href();
                        const isActive = isNavActive(href, page.url);
                        return (
                            <Link
                                key={item.title}
                                href={href}
                                className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                                    isActive
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'
                                }`}
                            >
                                <item.icon className="h-4 w-4" /> {item.title}
                            </Link>
                        );
                    })}
                </nav>
            </header>
            <main className="mx-auto max-w-5xl p-4">{children}</main>
        </div>
    );
}
