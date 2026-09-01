import type { Account, Employee, EmployeeLedgerEntry } from '@/types';
import type { Paginated } from '@/types/pagination';

export interface EmployeesProps {
    employees: Paginated<Employee>;
    filters: { search?: string; status?: string; sort?: string; per_page?: number };
    summary: {
        total_staff: number;
        active_staff: number;
        pending_advances: number;
    };
}

export interface EmployeeShowProps {
    employee: Employee;
    transactions: Paginated<EmployeeLedgerEntry>;
    accounts: Pick<Account, 'id' | 'name' | 'account_number'>[];
    filters: { date_filter?: string; start_date?: string; end_date?: string; specific_date?: string };
}
