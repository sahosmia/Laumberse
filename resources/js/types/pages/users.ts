import type { Outlet, User } from '@/types';
import type { Paginated } from '@/types/pagination';

export interface UsersProps {
    users: Paginated<User>;
    roles: string[];
    outlets: Pick<Outlet, 'id' | 'name' | 'code'>[];
    filters: { search?: string; sort?: string; per_page?: number };
}
