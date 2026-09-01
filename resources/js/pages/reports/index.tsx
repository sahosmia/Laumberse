import { StatCard } from '@/components/ui/stat-card';
import { useIsDarkMode } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/format';
import { type BreadcrumbItem } from '@/types';
import { REPORT_PERIODS, type ReportPeriod, type ReportsProps } from '@/types/pages/reports';
import { Head, router } from '@inertiajs/react';
import { Calendar, Check, DollarSign, FileText, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Reports',
        href: '/reports',
    },
];

export default function Reports({ monthlyData, categorySplit, totalServices, filters }: ReportsProps) {
    const [period, setPeriod] = useState<ReportPeriod>(filters.period);
    const [from, setFrom] = useState(filters.from || '');
    const [to, setTo] = useState(filters.to || '');

    const currentMonth = monthlyData[monthlyData.length - 1] || { revenue: 0, paid: 0, cost: 0 };

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

    const selectPeriod = (p: ReportPeriod) => {
        setPeriod(p);
        if (p === 'custom') return;
        router.get(route('reports'), { period: p }, { preserveState: true, preserveScroll: true });
    };

    const applyCustomRange = () => {
        router.get(
            route('reports'),
            { period: 'custom', from: from || undefined, to: to || undefined },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reports" />
            <div className="space-y-6 p-4">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Reports & Analytics</h1>
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Business performance for the current outlet</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-neutral-200 bg-white p-2 dark:border-neutral-800 dark:bg-neutral-900">
                        <Calendar className="ml-1 hidden h-4 w-4 text-neutral-400 sm:block" />
                        <select
                            value={period}
                            onChange={(e) => selectPeriod(e.target.value as ReportPeriod)}
                            className="h-9 rounded-lg border border-neutral-200 bg-transparent px-2 text-xs dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                        >
                            {REPORT_PERIODS.map((p) => (
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

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard icon={FileText} label="Total Services" value={totalServices.toString()} color="blue" />
                    <StatCard icon={TrendingUp} label="Revenue" value={formatCurrency(currentMonth.revenue)} color="purple" />
                    <StatCard icon={Check} label="Collected" value={formatCurrency(currentMonth.paid)} color="green" />
                    <StatCard
                        icon={DollarSign}
                        label="Profit"
                        value={formatCurrency(currentMonth.revenue - currentMonth.cost)}
                        color="amber"
                        sub={`Cost: ${formatCurrency(currentMonth.cost)}`}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="min-w-0 rounded-2xl border border-neutral-200 bg-white p-5 lg:col-span-2 dark:border-neutral-800 dark:bg-neutral-900">
                        <h3 className="mb-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Monthly Revenue vs Paid</h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: chartTheme.tick }} />
                                <YAxis tick={{ fontSize: 11, fill: chartTheme.tick }} />
                                <Tooltip
                                    formatter={(v) => formatCurrency(Number(v))}
                                    contentStyle={{ borderRadius: 12, fontSize: 12, ...chartTheme.tooltip }}
                                />
                                <Legend wrapperStyle={{ fontSize: 11, color: chartTheme.tick }} />
                                <Bar dataKey="revenue" fill="#6366f1" name="Revenue" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="paid" fill="#10b981" name="Paid" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="min-w-0 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                        <h3 className="mb-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Revenue by Category</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={categorySplit} cx="50%" cy="50%" outerRadius={75} dataKey="value" paddingAngle={3}>
                                    {categorySplit.map((e, i) => (
                                        <Cell key={i} fill={e.fill} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(v) => formatCurrency(Number(v))}
                                    contentStyle={{ borderRadius: 12, fontSize: 12, ...chartTheme.tooltip }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
                            {categorySplit.map((d) => (
                                <div key={d.name} className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                                    <div className="h-2.5 w-2.5 rounded-full" style={{ background: d.fill }} />
                                    {d.name}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="border-b border-neutral-100 px-5 py-3 dark:border-neutral-800">
                        <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Monthly Breakdown</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px] text-sm">
                            <thead>
                                <tr className="bg-neutral-50 text-xs tracking-wider text-neutral-500 uppercase dark:bg-neutral-800/50">
                                    <th className="px-5 py-2.5 text-left font-semibold">Month</th>
                                    <th className="px-3 py-2.5 text-right font-semibold">Revenue</th>
                                    <th className="px-3 py-2.5 text-right font-semibold">Paid</th>
                                    <th className="px-3 py-2.5 text-right font-semibold">Cost</th>
                                    <th className="px-5 py-2.5 text-right font-semibold">Profit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {monthlyData.map((m) => (
                                    <tr
                                        key={m.month}
                                        className="border-b border-neutral-50 transition-colors hover:bg-neutral-50/50 dark:border-neutral-800 dark:hover:bg-neutral-800/30"
                                    >
                                        <td className="px-5 py-3 font-semibold text-neutral-800 dark:text-neutral-200">{m.month}</td>
                                        <td className="px-3 py-3 text-right font-medium">{formatCurrency(m.revenue)}</td>
                                        <td className="px-3 py-3 text-right text-emerald-600">{formatCurrency(m.paid)}</td>
                                        <td className="px-3 py-3 text-right text-neutral-500">{formatCurrency(m.cost)}</td>
                                        <td className="px-5 py-3 text-right font-bold text-violet-600">{formatCurrency(m.revenue - m.cost)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
