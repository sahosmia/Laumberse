import type { Unit } from '@/types';
import type { Paginated } from '@/types/pagination';

export interface UnitsProps {
    units: Paginated<Unit>;
    filters: { search?: string; sort?: string; per_page?: number };
}
