import type { Employee } from '@/types';
import type { Paginated } from '@/types/pagination';

export interface EmployeesProps {
    employees: Paginated<Employee>;
    filters: { search?: string };
}
