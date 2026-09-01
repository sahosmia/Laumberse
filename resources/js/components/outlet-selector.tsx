import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { type SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { Check, ChevronDown, Store } from 'lucide-react';
import { useState } from 'react';

/**
 * Header outlet indicator/switcher — reads the server-resolved `outlet` shared prop only
 * (App\Support\OutletContext via HandleInertiaRequests). A non-switching user gets a
 * read-only indicator, never a dropdown with outlets they aren't allowed to pick; only a
 * `outlets.switch` holder gets the interactive version, and even then the option list is
 * exactly `outlet.available` as resolved server-side — nothing client-filtered.
 */
export function OutletSelector() {
    const { outlet } = usePage<SharedData>().props;
    const [switching, setSwitching] = useState(false);

    if (!outlet) {
        return null;
    }

    const label = outlet.isAll ? 'All Outlets' : (outlet.current?.name ?? 'No outlet');
    const shortLabel = outlet.isAll ? 'All' : (outlet.current?.code ?? '—');

    const switchTo = (target: string) => {
        if (switching) return;
        setSwitching(true);
        router.post(
            route('outlet-context.update'),
            { outlet: target },
            {
                preserveScroll: true,
                onFinish: () => setSwitching(false),
            },
        );
    };

    if (!outlet.canSwitch) {
        return (
            <div
                title="Your outlet"
                className="flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-neutral-600 dark:text-neutral-300"
            >
                <Store className="h-4 w-4 shrink-0 text-neutral-400" />
                <span className="max-w-[4rem] truncate sm:hidden">{shortLabel}</span>
                <span className="hidden max-w-[8rem] truncate sm:inline">{label}</span>
            </div>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    disabled={switching}
                    title="Switch active outlet"
                    className="flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 disabled:cursor-wait disabled:opacity-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                    <Store className="h-4 w-4 shrink-0 text-neutral-400" />
                    <span className="max-w-[4rem] truncate sm:hidden">{shortLabel}</span>
                    <span className="hidden max-w-[8rem] truncate sm:inline">{label}</span>
                    <ChevronDown className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Active Outlet</DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => switchTo('all')} className="flex cursor-pointer items-center justify-between">
                    All Outlets
                    {outlet.isAll && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {outlet.available.map((o) => (
                    <DropdownMenuItem key={o.id} onSelect={() => switchTo(String(o.id))} className="flex cursor-pointer items-center justify-between">
                        <span className="truncate">{o.name}</span>
                        {!outlet.isAll && outlet.current?.id === o.id && <Check className="h-4 w-4 shrink-0" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
