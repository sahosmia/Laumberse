import type { AssetCategory, ManageAsset } from '@/types';
import type { Paginated } from '@/types/pagination';

export interface ManageAssetsProps {
    manageAssets: Paginated<ManageAsset>;
    categories: AssetCategory[];
    filters: { search?: string };
}

export interface AssetCategoriesProps {
    categories: Paginated<AssetCategory>;
    filters: { search?: string };
}
