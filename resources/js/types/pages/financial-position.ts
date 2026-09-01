export interface FinancialPositionInvestorItem {
    id: number;
    name: string;
    current_balance: number | string;
}

export interface FinancialPositionCompanyLoanItem {
    id: number;
    lender_name: string;
    current_balance: number | string;
}

export interface FinancialPositionDebtorItem {
    id: number;
    name: string;
    total_due: number | string;
}

export interface FinancialPositionAccountItem {
    id: number;
    name: string;
    account_number: string | null;
    current_balance: number | string;
}

export interface FinancialPositionStaffAdvanceItem {
    id: number;
    name: string;
    current_balance: number | string;
}

export interface FinancialPositionAssetItem {
    id: number;
    name: string;
    cost: number | string;
}

export interface FinancialPositionProps {
    as_of_date: string | null;
    liabilities: {
        capital: { total: number; items: FinancialPositionInvestorItem[] };
        company_loan: { total: number; items: FinancialPositionCompanyLoanItem[] };
        gross_profit: number;
        total: number;
    };
    assets: {
        sundry_debtors: { total: number; items: FinancialPositionDebtorItem[] };
        cash_at_bank: { total: number; items: FinancialPositionAccountItem[] };
        staff_advances: { total: number; items: FinancialPositionStaffAdvanceItem[] };
        other_assets: { total: number; items: FinancialPositionAssetItem[] };
        total: number;
    };
}
