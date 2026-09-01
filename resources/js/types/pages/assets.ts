import type { Account, Asset, AssetCategory } from '@/types';
import type { Paginated } from '@/types/pagination';

export interface AssetsProps {
    assets: Paginated<Asset>;
    categories: AssetCategory[];
    accounts: Pick<Account, 'id' | 'name' | 'account_number'>[];
    filters: {
        search?: string;
        status?: string;
        sort?: string;
        per_page?: number;
        date_filter?: string;
        start_date?: string;
        end_date?: string;
        specific_date?: string;
    };
}

export interface AssetCategoriesProps {
    categories: Paginated<AssetCategory>;
    filters: { search?: string; sort?: string; per_page?: number };
}
