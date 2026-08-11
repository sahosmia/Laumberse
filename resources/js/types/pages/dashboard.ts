export interface DashboardProps {
    stats: {
        total_orders: number;
        total_revenue: number;
        total_paid: number;
        total_expense: number;
        unpaid_invoices: number;
        pending: number;
    };
    transportExpense: {
        business: number;
        delivery: number;
        total: number;
    };
    paymentStatusSplit: {
        paid: number;
        unpaid: number;
    };
    top_clients: {
        id: number;
        name: string;
        total_paid: number;
    }[];
    dailyRevenue: {
        day: string;
        revenue: number;
        paid: number;
    }[];
    filters: {
        period: DashboardPeriod;
        from: string | null;
        to: string | null;
    };
}

export const DASHBOARD_PERIODS = [
    { value: 'today', label: 'Today' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'this_year', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' },
] as const;

export type DashboardPeriod = (typeof DASHBOARD_PERIODS)[number]['value'];

export type DashboardColorKey = 'blue' | 'green' | 'red' | 'amber' | 'purple';

export interface DashboardStatCardProps {
    icon: React.ElementType;
    label: string;
    value: string | number;
    sub?: string;
    color?: DashboardColorKey;
    trend?: number;
}
