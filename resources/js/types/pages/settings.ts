export interface GlobalSettingsValues {
    salary_category_id: string | number;
    material_expense_category_id: string | number;
    asset_purchase_category_id: string | number;
    business_transportation_category_id: string | number;
    delivery_transportation_category_id: string | number;
    business_name: string | null;
    business_address: string | null;
    business_phone: string | null;
    business_email: string | null;
    week_start_day: number;
    logo_url: string | null;
    favicon_url: string | null;
}
