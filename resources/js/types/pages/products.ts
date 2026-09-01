import type { Category, Product } from '@/types';
import type { Paginated } from '@/types/pagination';

export interface ProductsProps {
    products: Paginated<Product>;
    categories: Category[];
    outlets: { id: number; name: string }[];
    filters: { search?: string; category_id?: string; sort?: string; per_page?: number };
}

/** Local shape used by the product-categories list/form (description is nullable, not optional, unlike the core Category type). */
export interface ProductCategory {
    id: number;
    name: string;
    slug: string;
    description: string | null;
}

export interface ProductCategoriesIndexProps {
    categories: Paginated<ProductCategory>;
    filters: { search?: string; sort?: string; per_page?: number };
}

export interface ProductCategoryFormProps {
    category?: ProductCategory;
}
