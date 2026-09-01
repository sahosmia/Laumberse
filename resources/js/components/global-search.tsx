import { Link } from '@inertiajs/react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import axios from 'axios';
import { CalendarClock, FileText, Loader2, Package, Receipt, Search, Shield, StickyNote, Store, UserCog, Users, Wallet } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface SearchResult {
    id: number;
    title: string;
    subtitle: string;
    url: string;
}

interface SearchResponse {
    clients: SearchResult[];
    invoices: SearchResult[];
    products: SearchResult[];
    notes: SearchResult[];
    employees: SearchResult[];
    expenses: SearchResult[];
    assets: SearchResult[];
    accounts: SearchResult[];
    meetings: SearchResult[];
    users: SearchResult[];
    outlets: SearchResult[];
}

const EMPTY_RESULTS: SearchResponse = {
    clients: [],
    invoices: [],
    products: [],
    notes: [],
    employees: [],
    expenses: [],
    assets: [],
    accounts: [],
    meetings: [],
    users: [],
    outlets: [],
};

const SECTIONS: { key: keyof SearchResponse; label: string; icon: typeof Users }[] = [
    { key: 'clients', label: 'Clients', icon: Users },
    { key: 'invoices', label: 'Invoices', icon: FileText },
    { key: 'meetings', label: 'Meetings & Follow-ups', icon: CalendarClock },
    { key: 'products', label: 'Products', icon: Package },
    { key: 'employees', label: 'Employees', icon: UserCog },
    { key: 'expenses', label: 'Expenses', icon: Receipt },
    { key: 'assets', label: 'Assets', icon: Wallet },
    { key: 'accounts', label: 'Accounts', icon: Wallet },
    { key: 'notes', label: 'Notes', icon: StickyNote },
    { key: 'users', label: 'Staff Users', icon: Shield },
    { key: 'outlets', label: 'Outlets', icon: Store },
];

export function GlobalSearch() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResponse>(EMPTY_RESULTS);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!open || query.trim().length < 2) {
            setResults(EMPTY_RESULTS);
            setLoading(false);
            return;
        }

        setLoading(true);
        const timeout = setTimeout(() => {
            axios
                .get<SearchResponse>(route('search'), { params: { q: query } })
                .then((res) => setResults(res.data))
                .finally(() => setLoading(false));
        }, 300);

        return () => clearTimeout(timeout);
    }, [query, open]);

    const handleOpenChange = (next: boolean) => {
        setOpen(next);
        if (!next) {
            setQuery('');
            setResults(EMPTY_RESULTS);
        }
    };

    const hasResults = SECTIONS.some((s) => results[s.key].length > 0);
    const hasQuery = query.trim().length >= 2;

    return (
        <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
            <DialogPrimitive.Trigger asChild>
                <button
                    type="button"
                    title="Search"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                >
                    <Search className="h-[18px] w-[18px]" />
                </button>
            </DialogPrimitive.Trigger>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
                {/* Centered via flexbox, not a transform — see modal.tsx for why. */}
                <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh]">
                    <DialogPrimitive.Content
                        onOpenAutoFocus={(e) => {
                            e.preventDefault();
                            inputRef.current?.focus();
                        }}
                        className="data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 flex max-h-[80dvh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl outline-none dark:bg-neutral-900"
                    >
                        <DialogPrimitive.Title className="sr-only">Search</DialogPrimitive.Title>
                        <div className="relative shrink-0 border-b border-neutral-100 dark:border-neutral-800">
                            <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search anything..."
                                className="h-14 w-full bg-transparent pr-11 pl-11 text-sm outline-none dark:text-neutral-100"
                            />
                            {loading && <Loader2 className="absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 animate-spin text-neutral-400" />}
                        </div>
                        <div className="min-h-0 flex-1 overflow-y-auto p-2">
                            {!hasQuery && <p className="p-6 text-center text-xs text-neutral-400 italic">Type at least 2 characters to search</p>}
                            {hasQuery && !hasResults && !loading && (
                                <p className="p-6 text-center text-xs text-neutral-400 italic">No results found</p>
                            )}
                            {SECTIONS.map(({ key, label, icon: Icon }) => {
                                const items = results[key];
                                if (items.length === 0) return null;

                                return (
                                    <div key={key} className="py-1">
                                        <p className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                                            <Icon className="h-3 w-3" /> {label}
                                        </p>
                                        {items.map((item) => (
                                            <Link
                                                key={item.id}
                                                href={item.url}
                                                onClick={() => handleOpenChange(false)}
                                                className="block rounded-lg px-3 py-2 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                                            >
                                                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{item.title}</p>
                                                <p className="text-xs text-neutral-500 dark:text-neutral-400">{item.subtitle}</p>
                                            </Link>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    </DialogPrimitive.Content>
                </div>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}
