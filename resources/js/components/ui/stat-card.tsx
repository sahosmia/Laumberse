import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

export type StatCardColorKey = 'blue' | 'green' | 'red' | 'amber' | 'purple';

const COLOR_CLASSES: Record<StatCardColorKey, string> = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-emerald-500 to-emerald-600',
    red: 'from-red-500 to-red-600',
    amber: 'from-amber-500 to-amber-600',
    purple: 'from-violet-500 to-violet-600',
};

export interface StatCardProps {
    icon: React.ElementType;
    label: string;
    value: string | number;
    sub?: string;
    color?: StatCardColorKey;
    /** Percentage change shown under the value, e.g. "+12% from last week". Omit where there's nothing to compare against (Reports doesn't pass this). */
    trend?: number;
}

/** Shared dashboard/reports stat tile — was previously duplicated identically in dashboard.tsx and reports/index.tsx. */
export function StatCard({ icon: Icon, label, value, sub, color = 'blue', trend }: StatCardProps) {
    return (
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 transition-shadow duration-300 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-start justify-between">
                <div>
                    <p className="mb-1 text-sm font-medium text-neutral-500 dark:text-neutral-400">{label}</p>
                    <p className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">{value}</p>
                    {sub && <p className="mt-1 text-xs text-neutral-400">{sub}</p>}
                </div>
                <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${COLOR_CLASSES[color]} flex items-center justify-center shadow-lg`}>
                    <Icon className="h-5 w-5 text-white" />
                </div>
            </div>
            {trend && (
                <div className={`mt-3 flex items-center gap-1 text-xs font-medium ${trend > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {trend > 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                    {Math.abs(trend)}% from last week
                </div>
            )}
        </div>
    );
}
