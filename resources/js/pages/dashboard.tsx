import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Check, DollarSign, Package, AlertCircle, Clock, ArrowUpRight, ArrowDownRight, Truck, Calendar, Receipt } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { formatCurrency } from '@/lib/format';
import { DASHBOARD_PERIODS, type DashboardColorKey, type DashboardPeriod, type DashboardProps, type DashboardStatCardProps } from '@/types/pages/dashboard';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

function StatCard({ icon: Icon, label, value, sub, color = "blue", trend }: DashboardStatCardProps) {
  const colorMap: Record<DashboardColorKey, string> = {
    blue: "from-blue-500 to-blue-600",
    green: "from-emerald-500 to-emerald-600",
    red: "from-red-500 to-red-600",
    amber: "from-amber-500 to-amber-600",
    purple: "from-violet-500 to-violet-600",
  };
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 hover:shadow-lg transition-shadow duration-300 dark:bg-neutral-900">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-neutral-500 font-medium mb-1 dark:text-neutral-400">{label}</p>
          <p className="text-2xl font-bold text-neutral-900 tracking-tight dark:text-neutral-100">{value}</p>
          {sub && <p className="text-xs text-neutral-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center shadow-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      {trend && (
        <div className={`flex items-center gap-1 mt-3 text-xs font-medium ${trend > 0 ? "text-emerald-600" : "text-red-500"}`}>
          {trend > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
          {Math.abs(trend)}% from last week
        </div>
      )}
    </div>
  );
}

export default function Dashboard({ stats, transportExpense, paymentStatusSplit, top_clients, dailyRevenue, filters }: DashboardProps) {
    const [period, setPeriod] = useState<DashboardPeriod>(filters.period);
    const [from, setFrom] = useState(filters.from || '');
    const [to, setTo] = useState(filters.to || '');

    const pieData = [
        { name: "Paid", value: Number(paymentStatusSplit.paid), fill: "#10b981" },
        { name: "Unpaid", value: Number(paymentStatusSplit.unpaid), fill: "#ef4444" },
    ];

    const barData = top_clients.map(c => ({ name: c.name.split(" ")[0], total: Number(c.total_paid) }));

    const selectPeriod = (p: DashboardPeriod) => {
        setPeriod(p);
        if (p === 'custom') return;
        router.get(route('dashboard'), { period: p }, { preserveState: true, preserveScroll: true });
    };

    const applyCustomRange = () => {
        router.get(route('dashboard'), { period: 'custom', from: from || undefined, to: to || undefined }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="p-4 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Dashboard</h1>
                        <p className="text-sm text-neutral-500 mt-1 dark:text-neutral-400">Overview of your laundry business</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-2">
                        <Calendar className="w-4 h-4 text-neutral-400 ml-1 hidden sm:block" />
                        <select
                            value={period}
                            onChange={e => selectPeriod(e.target.value as DashboardPeriod)}
                            className="border border-neutral-200 dark:border-neutral-800 rounded-lg px-2 h-9 text-xs bg-transparent dark:text-neutral-100 dark:bg-neutral-900"
                        >
                            {DASHBOARD_PERIODS.map(p => (
                                <option key={p.value} value={p.value}>{p.label}</option>
                            ))}
                        </select>
                        {period === 'custom' && (
                            <div className="flex items-center gap-2 pl-1 border-l border-neutral-200 dark:border-neutral-800">
                                <input
                                    type="date"
                                    value={from}
                                    onChange={e => setFrom(e.target.value)}
                                    className="border border-neutral-200 dark:border-neutral-800 rounded-lg px-2 h-9 text-xs bg-transparent dark:text-neutral-100"
                                />
                                <span className="text-neutral-400 text-xs">to</span>
                                <input
                                    type="date"
                                    value={to}
                                    onChange={e => setTo(e.target.value)}
                                    className="border border-neutral-200 dark:border-neutral-800 rounded-lg px-2 h-9 text-xs bg-transparent dark:text-neutral-100"
                                />
                                <button
                                    onClick={applyCustomRange}
                                    className="px-3 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
                                >
                                    Apply
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard icon={Package} label="Total Orders" value={stats.total_orders} color="blue" />
                    <StatCard icon={DollarSign} label="Total Sales" value={formatCurrency(Number(stats.total_revenue))} color="purple" />
                    <StatCard icon={Check} label="Total Paid" value={formatCurrency(Number(stats.total_paid))} color="green" />
                    <StatCard icon={Receipt} label="Total Expense" value={formatCurrency(Number(stats.total_expense))} color="red" />
                    <StatCard icon={AlertCircle} label="Unpaid Invoices" value={stats.unpaid_invoices} color="amber" />
                    <StatCard icon={Clock} label="Pending" value={stats.pending} sub="deliveries" color="amber" />
                </div>

                <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Total Transportation Cost</h3>
                            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{formatCurrency(transportExpense.total)}</p>
                        </div>
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                            <Truck className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-neutral-500 dark:text-neutral-400">Business Transportation</span>
                            <span className="font-semibold text-neutral-900 dark:text-neutral-100">{formatCurrency(transportExpense.business)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-neutral-500 dark:text-neutral-400">Delivery Transportation</span>
                            <span className="font-semibold text-neutral-900 dark:text-neutral-100">{formatCurrency(transportExpense.delivery)}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 min-w-0 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5">
                        <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-4">Daily Revenue (Last 7 Days)</h3>
                        <ResponsiveContainer width="100%" height={260}>
                            <LineChart data={dailyRevenue}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
                                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, fill: "#3b82f6" }} />
                                <Line type="monotone" dataKey="paid" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="min-w-0 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5">
                        <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-4">Payment Status</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                                    {pieData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                                </Pie>
                                <Tooltip formatter={(v: number) => `${v} invoices`} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-col justify-center gap-2 mt-2">
                            {pieData.map((d) => (
                                <div key={d.name} className="flex items-center gap-2 text-xs">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.fill }} />
                                    <span className="text-neutral-600 dark:text-neutral-400">{d.name}: {d.value} invoices</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5">
                    <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-4">Top Clients by Revenue</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                            <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                            <Bar dataKey="total" fill="#6366f1" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </AppLayout>
    );
}
