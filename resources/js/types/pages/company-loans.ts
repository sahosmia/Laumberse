import type { Account, CompanyLoan, CompanyLoanTransaction } from '@/types';
import type { Paginated } from '@/types/pagination';

export interface CompanyLoansProps {
    companyLoans: Paginated<CompanyLoan>;
    filters: { search?: string; sort?: string; per_page?: number };
}

export interface CompanyLoanShowProps {
    companyLoan: CompanyLoan;
    transactions: Paginated<CompanyLoanTransaction>;
    accounts: Pick<Account, 'id' | 'name' | 'account_number'>[];
    filters: { date_filter?: string; start_date?: string; end_date?: string; specific_date?: string };
}
