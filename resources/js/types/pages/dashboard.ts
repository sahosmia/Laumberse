export interface DashboardMeetingItem {
    id: number;
    type: 'meeting' | 'follow_up';
    scheduled_at: string;
    client: { id: number; name: string } | null;
    employee: { id: number; name: string } | null;
}

export interface DashboardMeetingList {
    items: DashboardMeetingItem[];
    total: number;
}

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
    accounts: {
        items: {
            id: number;
            name: string;
            account_number: string | null;
            current_balance: number;
        }[];
        total: number;
    };
    meetings: DashboardMeetingList;
    followUps: DashboardMeetingList;
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
