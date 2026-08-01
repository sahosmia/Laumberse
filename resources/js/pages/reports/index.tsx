import { Head } from '@inertiajs/react';
import { FileText, TrendingUp, Check, AlertCircle, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Reports',
        href: '/reports',
    },
];

const formatCurrency = (n: number) => `৳${n.toLocaleString("en-BD")}`;

type ColorKey = "blue" | "green" | "red" | "amber" | "purple";

interface StatCardProps {
    icon: React.ElementType;
    label: string;
    value: string;
    sub?: string;
    color?: ColorKey;
}

function StatCard({ icon: Icon, label, value, sub, color = "blue" }: StatCardProps) {
    const colorMap: Record<ColorKey, string> = {
      blue: "from-blue-500 to-blue-600",
      green: "from-emerald-500 to-emerald-600",
      red: "from-red-500 to-red-600",
      amber: "from-amber-500 to-amber-600",
      purple: "from-violet-500 to-violet-600",
    };
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-neutral-500 font-medium mb-1">{label}</p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">{value}</p>
            {sub && <p className="text-xs text-neutral-400 mt-1">{sub}</p>}
          </div>
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center shadow-lg`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    );
}

interface MonthlyData {
    month: string;
    revenue: number;
    paid: number;
    due: number;
    cost: number;
}

interface CategorySplit {
    name: string;
    value: number;
    fill: string;
}

interface ReportsProps {
    monthlyData: MonthlyData[];
    categorySplit: CategorySplit[];
    totalServices: number;
}

export default function Reports({ monthlyData, categorySplit, totalServices }: ReportsProps) {
    const currentMonth = monthlyData[monthlyData.length - 1] || { revenue: 0, paid: 0, due: 0, cost: 0 };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reports" />
            <div className="p-4 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Reports & Analytics</h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Monthly business performance</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    <StatCard icon={FileText} label="Total Services" value={totalServices.toString()} color="blue" />
                    <StatCard icon={TrendingUp} label="Revenue" value={formatCurrency(currentMonth.revenue)} color="purple" />
                    <StatCard icon={Check} label="Collected" value={formatCurrency(currentMonth.paid)} color="green" />
                    <StatCard icon={AlertCircle} label="Outstanding" value={formatCurrency(currentMonth.due)} color="red" />
                    <StatCard icon={DollarSign} label="Profit" value={formatCurrency(currentMonth.revenue - currentMonth.cost)} color="amber" sub={`Estimated Cost: ${formatCurrency(currentMonth.cost)}`} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 min-w-0 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5">
                        <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-4">Monthly Revenue vs Paid vs Due</h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                                <Legend wrapperStyle={{ fontSize: 11 }} />
                                <Bar dataKey="revenue" fill="#6366f1" name="Revenue" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="paid" fill="#10b981" name="Paid" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="due" fill="#ef4444" name="Due" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="min-w-0 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5">
                        <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-4">Revenue by Category</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={categorySplit} cx="50%" cy="50%" outerRadius={75} dataKey="value" paddingAngle={3}>
                                    {categorySplit.map((e, i) => <Cell key={i} fill={e.fill} />)}
                                </Pie>
                                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-2">
                            {categorySplit.map((d) => (
                                <div key={d.name} className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.fill }} />
                                    {d.name}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                    <div className="px-5 py-3 border-b border-neutral-100 dark:border-neutral-800">
                        <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Monthly Breakdown</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[600px]">
                            <thead>
                                <tr className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 text-xs uppercase tracking-wider">
                                    <th className="text-left px-5 py-2.5 font-semibold">Month</th>
                                    <th className="text-right px-3 py-2.5 font-semibold">Revenue</th>
                                    <th className="text-right px-3 py-2.5 font-semibold">Paid</th>
                                    <th className="text-right px-3 py-2.5 font-semibold">Due</th>
                                    <th className="text-right px-3 py-2.5 font-semibold">Cost</th>
                                    <th className="text-right px-5 py-2.5 font-semibold">Profit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {monthlyData.map((m) => (
                                    <tr key={m.month} className="border-b border-neutral-50 dark:border-neutral-800 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                                        <td className="px-5 py-3 font-semibold text-neutral-800 dark:text-neutral-200">{m.month}</td>
                                        <td className="px-3 py-3 text-right font-medium">{formatCurrency(m.revenue)}</td>
                                        <td className="px-3 py-3 text-right text-emerald-600">{formatCurrency(m.paid)}</td>
                                        <td className="px-3 py-3 text-right text-red-500">{formatCurrency(m.due)}</td>
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
