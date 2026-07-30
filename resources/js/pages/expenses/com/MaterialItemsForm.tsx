import { Plus, Trash2 } from "lucide-react";
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Material } from '@/types';

interface MaterialItem {
    material_id: string | number;
    quantity: number | '';
    unit_price: number | '';
}

interface MaterialItemsFormProps {
    items: MaterialItem[];
    materials: Material[];
    errors: Record<string, string>;
    onChange: (items: MaterialItem[]) => void;
}

export function MaterialItemsForm({ items, materials, errors, onChange }: MaterialItemsFormProps) {
    const handleAddItem = () => {
        onChange([
            ...items,
            { material_id: '', quantity: 1, unit_price: 0 }
        ]);
    };

    const handleRemoveItem = (indexToRemove: number) => {
        onChange(items.filter((_, i) => i !== indexToRemove));
    };

    const handleItemChange = (index: number, field: keyof MaterialItem, value: any) => {
        const newItems = [...items];

        if (field === 'material_id') {
            newItems[index] = {
                ...newItems[index],
                material_id: value,
                unit_price: 0
            };
        } else {
            newItems[index] = {
                ...newItems[index],
                [field]: value
            };
        }

        onChange(newItems);
    };

    return (
        <div className="space-y-3 bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700">
            <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Materials</h4>
                <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs text-blue-600 font-semibold flex items-center gap-1"
                >
                    <Plus className="w-3 h-3" /> Add Item
                </button>
            </div>

            <div className="space-y-3">
                {items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-start bg-white dark:bg-neutral-900 p-2 rounded-lg border border-neutral-100 dark:border-neutral-800 shadow-sm relative pr-8">
                        <div className="col-span-6 space-y-1">
                            <label className="text-[10px] font-bold text-neutral-400 uppercase">Material</label>
                            <SearchableSelect
                                options={materials.map(m => ({
                                    label: m.unit ? `${m.name} (${m.unit.short_name})` : m.name,
                                    value: m.id
                                }))}
                                value={item.material_id}
                                onChange={(val) => handleItemChange(index, 'material_id', val)}
                                placeholder="Select"
                            />
                        </div>
                        <div className="col-span-3 space-y-1">
                            <label className="text-[10px] font-bold text-neutral-400 uppercase">Qty</label>
                            <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => {
                                    let val = e.target.value;
                                    if (val.length > 1 && val.startsWith('0') && val[1] !== '.') {
                                        val = val.replace(/^0+/, '');
                                    }
                                    handleItemChange(index, 'quantity', val === '' ? '' : parseFloat(val));
                                }}
                                className="w-full border border-neutral-200 dark:border-neutral-800 rounded-lg px-2 py-1.5 text-xs bg-transparent dark:text-neutral-100"
                                step="any"
                            />
                        </div>
                        <div className="col-span-3 space-y-1">
                            <label className="text-[10px] font-bold text-neutral-400 uppercase">Price</label>
                            <input
                                type="number"
                                value={item.unit_price}
                                onChange={(e) => {
                                    let val = e.target.value;
                                    if (val.length > 1 && val.startsWith('0') && val[1] !== '.') {
                                        val = val.replace(/^0+/, '');
                                    }
                                    handleItemChange(index, 'unit_price', val === '' ? '' : parseFloat(val));
                                }}
                                className="w-full border border-neutral-200 dark:border-neutral-800 rounded-lg px-2 py-1.5 text-xs bg-transparent dark:text-neutral-100"
                                step="any"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="absolute top-1/2 -translate-y-1/2 right-1 p-1 text-neutral-400 hover:text-red-500 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}

                {items.length === 0 && (
                    <p className="text-[10px] text-center text-neutral-400 italic py-2">No items added</p>
                )}
                {errors.items && <p className="text-xs text-red-500">{errors.items}</p>}
            </div>
        </div>
    );
}
