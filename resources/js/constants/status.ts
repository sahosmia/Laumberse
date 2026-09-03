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

/** The laundry workflow's pipeline order — In House (intake) through Ready (awaiting pickup), then Delivered; Cancelled can happen at any stage. */
export const INVOICE_STATUSES = ['In House', 'Pre Wash', 'Washing', 'Extract', 'Drying', 'Pressing', 'Ready', 'Delivered', 'Cancelled'] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];
/** Every status is settable directly on the invoice create/edit form — same set as INVOICE_STATUSES. */
export const INVOICE_FORM_STATUSES: readonly InvoiceStatus[] = [
    'In House',
    'Pre Wash',
    'Washing',
    'Extract',
    'Drying',
    'Pressing',
    'Ready',
    'Delivered',
    'Cancelled',
];
export const INVOICE_STATUS_STYLES: Record<InvoiceStatus, string> = {
    'In House': 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800',
    'Pre Wash': 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-800',
    Washing: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
    Extract: 'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-400 dark:border-cyan-800',
    Drying: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800',
    Pressing: 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-400 dark:border-violet-800',
    Ready: 'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800',
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

export const ACCOUNT_TRANSACTION_TYPES = ['credit', 'debit'] as const;
export type AccountTransactionType = (typeof ACCOUNT_TRANSACTION_TYPES)[number];
export const ACCOUNT_TRANSACTION_TYPE_STYLES: Record<AccountTransactionType, string> = {
    credit: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    debit: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export const INVESTOR_TRANSACTION_TYPES = ['invest', 'withdraw'] as const;
export type InvestorTransactionType = (typeof INVESTOR_TRANSACTION_TYPES)[number];
export const INVESTOR_TRANSACTION_TYPE_STYLES: Record<InvestorTransactionType, string> = {
    invest: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    withdraw: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export const COMPANY_LOAN_TRANSACTION_TYPES = ['loan', 'repay', 'interest'] as const;
export type CompanyLoanTransactionType = (typeof COMPANY_LOAN_TRANSACTION_TYPES)[number];
export const COMPANY_LOAN_TRANSACTION_TYPE_STYLES: Record<CompanyLoanTransactionType, string> = {
    loan: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    repay: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    interest: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

/**
 * Selectable options on the "Add Transaction" form. Salary intentionally isn't here — it's paid
 * through Expenses (category = Salary), which also updates the Payroll ledger; recording it here
 * too would silently bypass Payroll and let the same month get paid twice. `EmployeeTransactionType`
 * still includes 'salary' below so any pre-existing historical record of that type keeps rendering.
 */
export const EMPLOYEE_TRANSACTION_TYPES = ['advance', 'loan', 'loan_return'] as const;
export type EmployeeTransactionType = (typeof EMPLOYEE_TRANSACTION_TYPES)[number] | 'salary';
export const EMPLOYEE_TRANSACTION_TYPE_LABELS: Record<EmployeeTransactionType, string> = {
    salary: 'Salary',
    advance: 'Advance',
    loan: 'Loan',
    loan_return: 'Loan Return',
};
export const EMPLOYEE_TRANSACTION_TYPE_STYLES: Record<EmployeeTransactionType, string> = {
    salary: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    advance: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    loan: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    loan_return: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

export const CLIENT_ACTIVITY_TYPES = ['meeting', 'follow_up'] as const;
export type ClientActivityType = (typeof CLIENT_ACTIVITY_TYPES)[number];
export const CLIENT_ACTIVITY_TYPE_LABELS: Record<ClientActivityType, string> = {
    meeting: 'Meeting',
    follow_up: 'Follow-up',
};
export const CLIENT_ACTIVITY_TYPE_STYLES: Record<ClientActivityType, string> = {
    meeting: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    follow_up: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

export const CLIENT_ACTIVITY_STATUSES = ['pending', 'done', 'cancelled'] as const;
export type ClientActivityStatus = (typeof CLIENT_ACTIVITY_STATUSES)[number];
export const CLIENT_ACTIVITY_STATUS_STYLES: Record<ClientActivityStatus, string> = {
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    done: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};
