import type { AssetStatus, ClientType, DiscountType, InvoiceStatus, PaymentStatus } from '@/constants/status';
import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    settings: {
        salary_category_id: number | null;
        material_expense_category_id: number | null;
        asset_purchase_category_id: number | null;
        business_transportation_category_id: number | null;
        delivery_transportation_category_id: number | null;
        business_name: string | null;
        logo_url: string | null;
    };
    notifications: {
        unread_count: number;
    };
    /** Null on non-staff (e.g. portal) requests — see App\Support\OutletContext. */
    outlet: OutletContext | null;
    [key: string]: unknown;
}
export interface Auth {
    user: User;
    /** Deliberately minimal — the shared prop only sends what the portal layout needs, not the full Client record. */
    client?: Pick<Client, 'id' | 'name' | 'client_uuid'> | null;
    permissions: string[];
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
    items?: NavItem[];
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    roles?: Role[];
    /** Null for a global user with no single home outlet. */
    outlet_id?: number | null;
    outlet?: Pick<Outlet, 'id' | 'name' | 'code'> | null;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Outlet {
    id: number;
    name: string;
    code: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    status: 'active' | 'inactive';
    created_at: string;
}

/**
 * The staff-authenticated request's active outlet — shared on every Inertia page via
 * HandleInertiaRequests, resolved server-side by App\Support\OutletContext. `current` is null
 * exactly when `isAll` is true (a switch-capable user currently viewing "All Outlets").
 */
export interface OutletContext {
    current: Outlet | null;
    assigned: Outlet | null;
    available: Outlet[];
    canSwitch: boolean;
    isAll: boolean;
}

export interface Role {
    id: number;
    name: string;
    permissions?: { id: number; name: string }[];
}

export interface Category {
    id: number;
    name: string;
    slug: string;
    description?: string;
}

export interface Unit {
    id: number;
    name: string;
    short_name: string;
}

export interface Product {
    id: number;
    name: string;
    category_id: number;
    category?: Category;
    image: string | null;
    image_url: string | null;
    price: number;
    outlet_prices?: OutletProductPrice[];
}

export interface CustomerProductPrice {
    id: number;
    customer_id: number;
    product_id: number;
    product?: Product;
    custom_price: number;
}

export interface OutletProductPrice {
    id: number;
    outlet_id: number;
    product_id: number;
    price: number;
}

export interface Client {
    id: number;
    client_uuid?: string;
    /** Null for a Corporate client — it isn't tied to any single branch. See the outlet_id migration docblock. */
    outlet_id?: number | null;
    outlet?: Pick<Outlet, 'id' | 'name' | 'code'> | null;
    username?: string | null;
    name: string;
    phone: string;
    type: ClientType;
    address?: string;
    /** Staff-only — never present on the client portal's shared auth.client prop. */
    internal_note?: string | null;
    total_orders?: number;
    total_due?: number;
    total_paid?: number;
    custom_prices?: CustomerProductPrice[];
}

export interface InvoiceItem {
    id: number;
    invoice_id: number;
    product_id: number;
    product?: Product;
    qty: number;
    price: number;
}

export interface Invoice {
    id: number;
    invoice_uuid: string;
    outlet_id?: number | null;
    outlet?: Pick<Outlet, 'id' | 'name' | 'code'> | null;
    date: string;
    client_id: number;
    client: Client;
    account_id: number | null;
    account?: Account;
    discount_amount: number;
    discount_type: DiscountType;
    delivery_charge: number;
    total: number;
    paid: number;
    due: number;
    status: InvoiceStatus;
    method: string;
    remarks: string | null;
    /** Staff-only — never sent to the client portal or printed on the invoice PDF. */
    internal_note?: string | null;
    payment_status: PaymentStatus;
    payment_date: string | null;
    items?: InvoiceItem[];
}

export interface ExpenseCategory {
    id: number;
    name: string;
    description?: string;
}

export interface Material {
    id: number;
    name: string;
    unit_id?: number;
    unit?: Unit;
}

export interface ExpenseMaterial {
    id: number;
    expense_id: number;
    material_id: number;
    material?: Material;
    quantity: number;
    unit_price: number;
    amount: number;
}

export type ExpenseType = 'general' | 'salary' | 'material' | 'asset';

export interface Expense {
    id: number;
    unique_id?: string;
    outlet_id?: number | null;
    outlet?: Pick<Outlet, 'id' | 'name' | 'code'> | null;
    expense_category_id: number;
    category?: ExpenseCategory;
    account_id: number;
    account?: Account;
    type: ExpenseType;
    amount: number;
    date: string;
    description?: string;
    asset_id?: number;
    asset?: Asset;
    payroll?: {
        employee_id: number;
        month: number;
        year: number;
        base_salary: number;
        bonus: number;
        deduction: number;
        deduction_note: string;
        note?: string;
        paid_amount: number;
        net_salary: number;
        status: string;
        employee?: Employee;
    };
    materials?: ExpenseMaterial[];
}

export interface Employee {
    id: number;
    outlet_id?: number | null;
    outlet?: Pick<Outlet, 'id' | 'name' | 'code'> | null;
    employee_id: string;
    name: string;
    phone: string;
    email?: string | null;
    designation: string;
    base_salary: number;
    opening_balance: number;
    current_balance: number;
    is_active: boolean;
}

/**
 * A row in an employee's merged ledger — either an advance/loan/loan_return (source: 'transaction',
 * from employee_transactions) or a salary payment (source: 'salary', from expenses joined to
 * payrolls). `id` is only unique WITHIN a source (a transaction and a salary row can share the same
 * numeric id, since they come from different tables) — use `${source}-${id}` as a React key.
 */
export interface EmployeeLedgerEntry {
    id: number;
    source: 'transaction' | 'salary';
    type: 'salary' | 'advance' | 'loan' | 'loan_return';
    account_id: number | null;
    account_name: string | null;
    account_number: string | null;
    amount: number;
    running_balance: number;
    date: string;
    note: string | null;
}

export interface AssetCategory {
    id: number;
    name: string;
    description?: string;
}

export interface NoteCategory {
    id: number;
    name: string;
    description?: string;
}

export interface Note {
    id: number;
    title: string;
    details: string | null;
    note_category_id: number | null;
    category?: NoteCategory;
    created_at: string;
    updated_at: string;
}

export interface Asset {
    id: number;
    outlet_id?: number | null;
    outlet?: Pick<Outlet, 'id' | 'name' | 'code'> | null;
    name: string;
    description?: string;
    purchase_date: string;
    cost: number;
    status: AssetStatus;
    asset_category_id: number;
    category?: AssetCategory;
}

export interface Account {
    id: number;
    outlet_id?: number | null;
    outlet?: Pick<Outlet, 'id' | 'name' | 'code'> | null;
    name: string;
    account_number: string | null;
    opening_balance: number;
    current_balance: number;
    created_at: string;
}

export interface AccountTransaction {
    id: number;
    account_id: number;
    type: 'debit' | 'credit';
    amount: number;
    running_balance: number;
    description: string | null;
    created_at: string;
}

export interface Investor {
    id: number;
    name: string;
    phone: string | null;
    opening_balance: number;
    current_balance: number;
    created_at: string;
}

export interface InvestorTransaction {
    id: number;
    investor_id: number;
    account_id: number | null;
    account_name: string | null;
    account_number: string | null;
    transaction_type: 'invest' | 'withdraw';
    amount: number;
    running_balance: number;
    date: string;
    note: string | null;
}

export interface CompanyLoan {
    id: number;
    lender_name: string;
    initial_loan_amount: number;
    current_balance: number;
    created_at: string;
}

export interface ClientActivity {
    id: number;
    outlet_id?: number | null;
    outlet?: Pick<Outlet, 'id' | 'name' | 'code'> | null;
    client_id: number;
    parent_activity_id: number | null;
    employee_id: number | null;
    employee?: Pick<Employee, 'id' | 'name'> | null;
    created_by: number | null;
    creator?: Pick<User, 'id' | 'name'> | null;
    type: 'meeting' | 'follow_up';
    scheduled_at: string;
    note: string | null;
    status: 'pending' | 'done' | 'cancelled';
    next_follow_up_date: string | null;
    reminder_minutes: number | null;
}

export interface AppNotification {
    id: string;
    type: string | null;
    title: string;
    message: string;
    url: string | null;
    read_at: string | null;
    created_at: string;
}

export interface CompanyLoanTransaction {
    id: number;
    company_loan_id: number;
    account_id: number | null;
    account_name: string | null;
    account_number: string | null;
    transaction_type: 'loan' | 'repay' | 'interest';
    amount: number;
    running_balance: number;
    date: string;
    note: string | null;
}
