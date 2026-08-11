import type { Material, Unit } from '@/types';
import type { Paginated } from '@/types/pagination';

export interface MaterialsProps {
    materials: Paginated<Material>;
    units: Unit[];
    filters: { search?: string };
}
