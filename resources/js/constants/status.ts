/**
 * Single source of truth for every enum-like status/type field in the app.
 * Mirrors the backend enums in app/Enums — keep both in sync when values change.
 */

export const CLIENT_TYPES = ['Consumer', 'Corporate', 'B2B'] as const;
export type ClientType = (typeof CLIENT_TYPES)[number];
export const CLIENT_TYPE_STYLES: Record<ClientType, string> = {
    Consumer: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    Corporate: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    B2B: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
};

export const INVOICE_STATUSES = ['Pending', 'Processing', 'In House', 'Delivered', 'Cancelled'] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];
/** Statuses settable directly on the invoice create/edit form; Pending/Cancelled are only reachable via the inline status dropdown. */
export const INVOICE_FORM_STATUSES: readonly InvoiceStatus[] = ['Processing', 'In House', 'Delivered'];
export const INVOICE_STATUS_STYLES: Record<InvoiceStatus, string> = {
    Pending: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
    Processing: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
    'In House': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
    Delivered: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
    Cancelled: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
};

export const PAYMENT_STATUSES = ['Paid', 'Unpaid'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export const PAYMENT_STATUS_STYLES: Record<PaymentStatus, string> = {
    Paid: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
    Unpaid: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
};

export const DISCOUNT_TYPES = ['Fixed', 'Percentage'] as const;
export type DiscountType = (typeof DISCOUNT_TYPES)[number];

export const ASSET_STATUSES = ['Active', 'Maintenance', 'Disposed'] as const;
export type AssetStatus = (typeof ASSET_STATUSES)[number];
export const ASSET_STATUS_STYLES: Record<AssetStatus, string> = {
    Active: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    Maintenance: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    Disposed: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
};

export const PAYROLL_STATUSES = ['pending', 'partial', 'completed'] as const;
export type PayrollStatus = (typeof PAYROLL_STATUSES)[number];
export const PAYROLL_STATUS_STYLES: Record<PayrollStatus, string> = {
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    partial: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    pending: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
};
