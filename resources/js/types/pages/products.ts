import type { Category, Product } from '@/types';
import type { Paginated } from '@/types/pagination';

export interface ProductsProps {
    products: Paginated<Product>;
    categories: Category[];
    filters: { search?: string };
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
}

export interface ProductCategoryFormProps {
    category?: ProductCategory;
}
