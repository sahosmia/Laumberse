import type { Role } from '@/types';
import type { Paginated } from '@/types/pagination';

export interface RolesProps {
    roles: Paginated<Role>;
    availablePermissions: string[];
    filters: { search?: string; sort?: string; per_page?: number };
}
