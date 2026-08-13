import type { PayrollStatus } from '@/constants/status';
import type { Paginated } from '@/types/pagination';

export interface Payroll {
    id: number;
    employee_id: number;
    employee?: {
        id: number;
        name: string;
    };
    expense_id?: number;
    month: number;
    year: number;
    base_salary: number;
    bonus: number;
    deduction: number;
    net_salary: number;
    paid_amount: number;
    status: PayrollStatus;
    deduction_note?: string;
}

export interface PayrollsProps {
    payrolls: Paginated<Payroll>;
}
