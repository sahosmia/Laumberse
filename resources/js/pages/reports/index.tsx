import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/format';
import { type BreadcrumbItem } from '@/types';
import type { ReportsColorKey, ReportsProps, ReportsStatCardProps } from '@/types/pages/reports';
import { Head } from '@inertiajs/react';
import { Check, DollarSign, FileText, TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Reports',
        href: '/reports',
    },
];

function StatCard({ icon: Icon, label, value, sub, color = 'blue' }: ReportsStatCardProps) {
    const colorMap: Record<ReportsColorKey, string> = {
        blue: 'from-blue-500 to-blue-600',
        green: 'from-emerald-500 to-emerald-600',
        red: 'from-red-500 to-red-600',
        amber: 'from-amber-500 to-amber-600',
        purple: 'from-violet-500 to-violet-600',
    };
    return (
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 transition-shadow duration-300 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-start justify-between">
                <div>
                    <p className="mb-1 text-sm font-medium text-neutral-500">{label}</p>
                    <p className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">{value}</p>
                    {sub && <p className="mt-1 text-xs text-neutral-400">{sub}</p>}
                </div>
                <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center shadow-lg`}>
                    <Icon className="h-5 w-5 text-white" />
                </div>
            </div>
        </div>
    );
}

export default function Reports({ monthlyData, categorySplit, totalServices }: ReportsProps) {
    const currentMonth = monthlyData[monthlyData.length - 1] || { revenue: 0, paid: 0, cost: 0 };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reports" />
            <div className="space-y-6 p-4">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Reports & Analytics</h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Monthly business performance</p>
                </div>

                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <StatCard icon={FileText} label="Total Services" value={totalServices.toString()} color="blue" />
                    <StatCard icon={TrendingUp} label="Revenue" value={formatCurrency(currentMonth.revenue)} color="purple" />
                    <StatCard icon={Check} label="Collected" value={formatCurrency(currentMonth.paid)} color="green" />
                    <StatCard
                        icon={DollarSign}
                        label="Profit"
                        value={formatCurrency(currentMonth.revenue - currentMonth.cost)}
                        color="amber"
                        sub={`Estimated Cost: ${formatCurrency(currentMonth.cost)}`}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="min-w-0 rounded-2xl border border-neutral-200 bg-white p-5 lg:col-span-2 dark:border-neutral-800 dark:bg-neutral-900">
                        <h3 className="mb-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Monthly Revenue vs Paid</h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                                <Legend wrapperStyle={{ fontSize: 11 }} />
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
                                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
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
