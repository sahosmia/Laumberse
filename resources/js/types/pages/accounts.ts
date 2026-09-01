import type { Account, AccountTransaction } from '@/types';
import type { Paginated } from '@/types/pagination';

export interface AccountsProps {
    accounts: Paginated<Account>;
    /** Full, unpaginated list — for the Transfer Funds dropdowns, which need every account regardless of the current page/search filter. */
    allAccounts: Pick<Account, 'id' | 'name' | 'current_balance'>[];
    filters: { search?: string; sort?: string; per_page?: number };
}

export interface AccountShowProps {
    account: Account;
    transactions: Paginated<AccountTransaction>;
    filters: { date_filter?: string; start_date?: string; end_date?: string; specific_date?: string };
}
