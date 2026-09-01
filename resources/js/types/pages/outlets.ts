import type { Outlet } from '@/types';
import type { Paginated } from '@/types/pagination';

export interface OutletsIndexProps {
    outlets: Paginated<Outlet>;
    filters: {
        search?: string;
        status?: string;
        sort?: string;
        per_page?: number;
    };
}
