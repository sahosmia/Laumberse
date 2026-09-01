import type { Account, Investor, InvestorTransaction } from '@/types';
import type { Paginated } from '@/types/pagination';

export interface InvestorsProps {
    investors: Paginated<Investor>;
    filters: { search?: string; sort?: string; per_page?: number };
}

export interface InvestorShowProps {
    investor: Investor;
    transactions: Paginated<InvestorTransaction>;
    accounts: Pick<Account, 'id' | 'name' | 'account_number'>[];
    filters: { date_filter?: string; start_date?: string; end_date?: string; specific_date?: string };
}
