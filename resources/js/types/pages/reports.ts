export interface MonthlyData {
    month: string;
    revenue: number;
    paid: number;
    cost: number;
}

export interface CategorySplit {
    name: string;
    value: number;
    fill: string;
}

export interface ReportsProps {
    monthlyData: MonthlyData[];
    categorySplit: CategorySplit[];
    totalServices: number;
    filters: {
        period: ReportPeriod;
        from: string | null;
        to: string | null;
    };
}

export const REPORT_PERIODS = [
    { value: 'today', label: 'Today' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'this_year', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' },
] as const;

export type ReportPeriod = (typeof REPORT_PERIODS)[number]['value'];
