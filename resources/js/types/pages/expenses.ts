import type { Account, Expense, ExpenseCategory, Material } from '@/types';
import type { Paginated } from '@/types/pagination';

export interface ExpensesProps {
    expenses: Paginated<Expense>;
    categories: ExpenseCategory[];
    accounts: Pick<Account, 'id' | 'name' | 'account_number'>[];
    materials: Material[];
    filters: {
        search?: string;
        category_id?: string;
        date_filter?: string;
        start_date?: string;
        end_date?: string;
        specific_date?: string;
        sort?: string;
        per_page?: number;
    };
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
    filters: { search?: string; sort?: string; per_page?: number };
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
        year: number | '';
        employee_id: string | number;
        bonus: number | '';
        deduction: number | '';
        deduction_note: string;
        note: string;
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
