import { StatCard } from '@/components/ui/stat-card';
import { useIsDarkMode } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { type BreadcrumbItem } from '@/types';
import { DASHBOARD_PERIODS, type DashboardMeetingList, type DashboardPeriod, type DashboardProps } from '@/types/pages/dashboard';
import { Head, Link, router } from '@inertiajs/react';
import { AlertCircle, ArrowRight, Calendar, CalendarClock, Check, Clock, DollarSign, Landmark, Package, Receipt, Truck } from 'lucide-react';
import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

/**
 * One card per activity type (Meeting / Follow-up), shown side by side on the dashboard. Each
 * table mixes upcoming and overdue rows together (ordered soonest/oldest-first by the backend) and
 * flags anything already past with a "Missed" badge, rather than splitting into separate tabs.
 */
function ActivityTable({ title, type, list }: { title: string; type: 'meeting' | 'follow_up'; list: DashboardMeetingList }) {
    // Hidden entirely when there's nothing pending of this type — not worth a card of empty state.
    if (list.total === 0) return null;

    return (
        <div className="min-w-0 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="flex items-center gap-1.5 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    <CalendarClock className="h-4 w-4" /> {title} ({list.total})
                </h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-neutral-100 text-left text-[10px] font-bold tracking-wider text-neutral-400 uppercase dark:border-neutral-800">
                            <th className="pr-3 pb-2">Client</th>
                            <th className="pr-3 pb-2">Date & Time</th>
                            <th className="pb-2">Assigned</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {list.items.map((a) => {
                            const isMissed = new Date(a.scheduled_at) < new Date();
                            return (
                                <tr key={a.id}>
                                    <td className="py-2.5 pr-3 font-medium text-neutral-800 dark:text-neutral-200">{a.client?.name ?? '—'}</td>
                                    <td className="py-2.5 pr-3 whitespace-nowrap text-neutral-600 dark:text-neutral-400">
                                        <div className="flex items-center gap-1.5">
                                            {formatDateTime(a.scheduled_at)}
                                            {isMissed && (
                                                <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600 dark:bg-red-900/30 dark:text-red-400">
                                                    Missed
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-2.5 text-neutral-600 dark:text-neutral-400">{a.employee?.name ?? 'Unassigned'}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <Link
                href={route('meetings.index', { status: 'pending', type })}
                className="mt-3 flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
                View all <ArrowRight className="h-3 w-3" />
            </Link>
        </div>
    );
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({
    stats,
    transportExpense,
    paymentStatusSplit,
    top_clients,
    dailyRevenue,
    accounts,
    meetings,
    followUps,
    filters,
}: DashboardProps) {
    const [period, setPeriod] = useState<DashboardPeriod>(filters.period);
    const [from, setFrom] = useState(filters.from || '');
    const [to, setTo] = useState(filters.to || '');

    // Recharts needs literal color values, not Tailwind `dark:` classes, so its grid/axis/tooltip
    // chrome is themed explicitly here instead of relying on the CSS cascade like the rest of the page.
    const isDark = useIsDarkMode();
    const chartTheme = {
        grid: isDark ? '#262626' : '#f1f5f9',
        tick: isDark ? '#a3a3a3' : '#94a3b8',
        tooltip: {
            border: `1px solid ${isDark ? '#262626' : '#e2e8f0'}`,
            background: isDark ? '#171717' : '#ffffff',
            color: isDark ? '#e5e5e5' : '#171717',
        },
    };

    const pieData = [
        { name: 'Paid', value: Number(paymentStatusSplit.paid), fill: '#10b981' },
        { name: 'Unpaid', value: Number(paymentStatusSplit.unpaid), fill: '#ef4444' },
    ];

    const barData = top_clients.map((c) => ({ name: c.name.split(' ')[0], total: Number(c.total_paid) }));

    const selectPeriod = (p: DashboardPeriod) => {
        setPeriod(p);
        if (p === 'custom') return;
        router.get(route('dashboard'), { period: p }, { preserveState: true, preserveScroll: true });
    };

    const applyCustomRange = () => {
        router.get(
            route('dashboard'),
            { period: 'custom', from: from || undefined, to: to || undefined },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="space-y-6 p-4">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Dashboard</h1>
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Overview of your laundry business</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-neutral-200 bg-white p-2 dark:border-neutral-800 dark:bg-neutral-900">
                        <Calendar className="ml-1 hidden h-4 w-4 text-neutral-400 sm:block" />
                        <select
                            value={period}
                            onChange={(e) => selectPeriod(e.target.value as DashboardPeriod)}
                            className="h-9 rounded-lg border border-neutral-200 bg-transparent px-2 text-xs dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                        >
                            {DASHBOARD_PERIODS.map((p) => (
                                <option key={p.value} value={p.value}>
                                    {p.label}
                                </option>
                            ))}
                        </select>
                        {period === 'custom' && (
                            <div className="flex items-center gap-2 border-l border-neutral-200 pl-1 dark:border-neutral-800">
                                <input
                                    type="date"
                                    value={from}
                                    onChange={(e) => setFrom(e.target.value)}
                                    className="h-9 rounded-lg border border-neutral-200 bg-transparent px-2 text-xs dark:border-neutral-800 dark:text-neutral-100"
                                />
                                <span className="text-xs text-neutral-400">to</span>
                                <input
                                    type="date"
                                    value={to}
                                    onChange={(e) => setTo(e.target.value)}
                                    className="h-9 rounded-lg border border-neutral-200 bg-transparent px-2 text-xs dark:border-neutral-800 dark:text-neutral-100"
                                />
                                <button
                                    onClick={applyCustomRange}
                                    className="h-9 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
                                >
                                    Apply
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <StatCard icon={Package} label="Total Orders" value={stats.total_orders} color="blue" />
                    <StatCard icon={DollarSign} label="Total Sales" value={formatCurrency(Number(stats.total_revenue))} color="purple" />
                    <StatCard icon={Check} label="Total Paid" value={formatCurrency(Number(stats.total_paid))} color="green" />
                    <StatCard icon={Receipt} label="Total Expense" value={formatCurrency(Number(stats.total_expense))} color="red" />
                    <StatCard icon={AlertCircle} label="Unpaid Invoices" value={stats.unpaid_invoices} color="amber" />
                    <StatCard icon={Clock} label="Pending" value={stats.pending} sub="in pipeline" color="amber" />
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="mb-1 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Cash Position</h3>
                                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{formatCurrency(accounts.total)}</p>
                                <p className="mt-1 text-xs text-neutral-400">
                                    across {accounts.items.length} account{accounts.items.length === 1 ? '' : 's'}
                                </p>
                            </div>
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
                                <Landmark className="h-5 w-5 text-white" />
                            </div>
                        </div>

                        {accounts.items.length > 0 && (
                            <div className="mt-4 divide-y divide-neutral-100 border-t border-neutral-100 dark:divide-neutral-800 dark:border-neutral-800">
                                {accounts.items.map((a) => (
                                    <div key={a.id} className="flex items-center justify-between py-2.5 text-sm">
                                        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                                            <span className="font-medium text-neutral-800 dark:text-neutral-200">{a.name}</span>
                                            {a.account_number && <span className="text-xs text-neutral-400">({a.account_number})</span>}
                                        </div>
                                        <span
                                            className={`font-semibold ${a.current_balance < 0 ? 'text-red-500' : 'text-neutral-900 dark:text-neutral-100'}`}
                                        >
                                            {formatCurrency(a.current_balance)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <Link
                            href={route('accounts.index')}
                            className="mt-3 flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                        >
                            View all accounts <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>

                    <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="mb-1 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Total Transportation Cost</h3>
                                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{formatCurrency(transportExpense.total)}</p>
                            </div>
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                                <Truck className="h-5 w-5 text-white" />
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-1 gap-3 border-t border-neutral-100 pt-4 sm:grid-cols-2 dark:border-neutral-800">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-neutral-500 dark:text-neutral-400">Business Transportation</span>
                                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                                    {formatCurrency(transportExpense.business)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-neutral-500 dark:text-neutral-400">Delivery Transportation</span>
                                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                                    {formatCurrency(transportExpense.delivery)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {(meetings.total > 0 || followUps.total > 0) && (
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <ActivityTable title="Meetings" type="meeting" list={meetings} />
                        <ActivityTable title="Follow-ups" type="follow_up" list={followUps} />
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="min-w-0 rounded-2xl border border-neutral-200 bg-white p-5 lg:col-span-2 dark:border-neutral-800 dark:bg-neutral-900">
                        <h3 className="mb-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Daily Revenue (Last 7 Days)</h3>
                        <ResponsiveContainer width="100%" height={260}>
                            <LineChart data={dailyRevenue}>
                                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                                <XAxis dataKey="day" tick={{ fontSize: 11, fill: chartTheme.tick }} />
                                <YAxis tick={{ fontSize: 11, fill: chartTheme.tick }} />
                                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, ...chartTheme.tooltip }} />
                                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, fill: '#3b82f6' }} />
                                <Line type="monotone" dataKey="paid" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="min-w-0 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                        <h3 className="mb-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Payment Status</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                                    {pieData.map((e, i) => (
                                        <Cell key={i} fill={e.fill} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(v) => `${Number(v)} invoices`}
                                    contentStyle={{ borderRadius: 12, fontSize: 12, ...chartTheme.tooltip }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-2 flex flex-col justify-center gap-2">
                            {pieData.map((d) => (
                                <div key={d.name} className="flex items-center gap-2 text-xs">
                                    <div className="h-2.5 w-2.5 rounded-full" style={{ background: d.fill }} />
                                    <span className="text-neutral-600 dark:text-neutral-400">
                                        {d.name}: {d.value} invoices
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                    <h3 className="mb-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Top Clients by Revenue</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: chartTheme.tick }} />
                            <YAxis tick={{ fontSize: 11, fill: chartTheme.tick }} />
                            <Tooltip
                                formatter={(v) => formatCurrency(Number(v))}
                                contentStyle={{ borderRadius: 12, fontSize: 12, ...chartTheme.tooltip }}
                            />
                            <Bar dataKey="total" fill="#6366f1" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </AppLayout>
    );
}
