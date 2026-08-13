import type { Expense, ExpenseCategory, Material } from '@/types';
import type { Paginated } from '@/types/pagination';

export interface ExpensesProps {
    expenses: Paginated<Expense>;
    categories: ExpenseCategory[];
    materials: Material[];
    filters: { search?: string; date_filter?: string; start_date?: string; end_date?: string };
}

export interface EligibleEmployee {
    id: number;
    name: string;
    base_salary: number;
    already_paid: number;
    bonus: number;
    deduction: number;
    net_salary: number;
    status: string;
}

export interface ExpenseShowProps {
    expense: Expense;
}

export interface ExpenseCategoriesProps {
    categories: Paginated<ExpenseCategory>;
    filters: { search?: string };
}

export interface MaterialItem {
    material_id: string | number;
    quantity: number | '';
    unit_price: number | '';
    isSaved?: boolean;
}

export interface MaterialItemsFormProps {
    items: MaterialItem[];
    materials: Material[];
    errors: Record<string, string>;
    onChange: (items: MaterialItem[]) => void;
}

export interface PayrollFormProps {
    data: {
        month: number;
        year: number;
        employee_id: string | number;
        bonus: number | '';
        deduction: number | '';
        deduction_note: string;
    };
    // Alignment with Inertia's useForm signature without using any
    setData: (key: string, value: string | number | boolean | null | undefined) => void;
    errors: Record<string, string | undefined>;
    eligibleEmployees: EligibleEmployee[];
    selectedEmployee: EligibleEmployee | null;
    netSalary: number;
    formatCurrency: (n: number | string) => string;
    onEmployeeChange: (val: string | number) => void;
}
