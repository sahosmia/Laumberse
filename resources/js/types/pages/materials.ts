import type { Account, Material, Unit } from '@/types';
import type { Paginated } from '@/types/pagination';

export interface MaterialsProps {
    materials: Paginated<Material>;
    allMaterials: Material[];
    units: Unit[];
    accounts: Pick<Account, 'id' | 'name' | 'account_number'>[];
    filters: { search?: string; unit_id?: string; sort?: string; per_page?: number };
}
