import { FormInput } from '@/components/ui/form-input';
import { FormSelect } from '@/components/ui/form-select';
import { ASSET_STATUSES } from '@/constants/status';
import type { AssetPurchaseFormProps } from '@/types/pages/expenses';

export function AssetPurchaseForm({ data, setData, errors, assetCategories }: AssetPurchaseFormProps) {
    return (
        <div className="space-y-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800/50">
            <h4 className="text-xs font-bold tracking-wider text-neutral-500 uppercase">Asset Details</h4>

            <FormInput
                id="asset_name"
                label="Asset Name"
                required
                value={data.asset_name}
                onChange={(e) => setData('asset_name', e.target.value)}
                className="rounded-lg border-neutral-200 bg-transparent dark:border-neutral-800 dark:text-neutral-100"
                placeholder="e.g. Dell Laptop"
                error={errors.asset_name}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormSelect
                    id="asset_category_id"
                    label="Asset Category"
                    required
                    value={data.asset_category_id}
                    onChange={(e) => setData('asset_category_id', e.target.value)}
                    error={errors.asset_category_id}
                >
                    <option value="">Select Category</option>
                    {assetCategories.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </FormSelect>
                <FormSelect id="asset_status" label="Status" value={data.asset_status} onChange={(e) => setData('asset_status', e.target.value)}>
                    {ASSET_STATUSES.map((s) => (
                        <option key={s} value={s}>
                            {s}
                        </option>
                    ))}
                </FormSelect>
            </div>
        </div>
    );
}
