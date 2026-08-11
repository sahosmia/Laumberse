import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';
import type { AssetStatus, ClientType, DiscountType, InvoiceStatus, PaymentStatus } from '@/constants/status';


export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    [key: string]: unknown;
}
export interface Auth {
    user: User;
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
    [key: string]: unknown; // This allows for additional properties...
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
    unit_id?: number;
    unit?: Unit;
     image: string | null;
    image_url: string | null;
    price: number;
}

export interface CustomerProductPrice {
    id: number;
    customer_id: number;
    product_id: number;
    custom_price: number;
}

export interface Client {
    id: number;
    name: string;
    phone: string;
    type: ClientType;
    address?: string;
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
    date: string;
    client_id: number;
    client: Client;
    subtotal: number;
    discount_amount: number;
    discount_type: DiscountType;
    total: number;
    paid: number;
    due: number;
    status: InvoiceStatus;
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

export interface Expense {
    id: number;
    expense_category_id: number;
    category?: ExpenseCategory;
    amount: number;
    payment_method: string;
    date: string;
    description?: string;
    payroll?: {
        employee_id: number;
        month: number;
        year: number;
        bonus: number;
        deduction: number;
        deduction_note: string;
    };
    materials?: ExpenseMaterial[];
}


export interface Employee {
    id: number;
    name: string;
    phone: string;
    email?: string | null;
    designation: string;
    base_salary: number;
    is_active: boolean;
}

export interface AssetCategory {
    id: number;
    name: string;
    description?: string;
}

export interface ManageAsset {
    id: number;
    name: string;
    description?: string;
    purchase_date: string;
    cost: number;
    status: AssetStatus;
    asset_category_id: number;
    category?: AssetCategory;
}
