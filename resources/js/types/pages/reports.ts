export type ReportsColorKey = 'blue' | 'green' | 'red' | 'amber' | 'purple';

export interface ReportsStatCardProps {
    icon: React.ElementType;
    label: string;
    value: string;
    sub?: string;
    color?: ReportsColorKey;
}

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
}
