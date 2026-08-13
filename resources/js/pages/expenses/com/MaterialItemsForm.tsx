import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal';
import { SearchableSelect } from '@/components/ui/searchable-select';
import type { MaterialItem, MaterialItemsFormProps } from '@/types/pages/expenses';
import { Check, Edit3, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

export function MaterialItemsForm({ items, materials, errors, onChange }: MaterialItemsFormProps) {
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const [itemIndexToDelete, setItemIndexToDelete] = useState<number | null>(null);
    const [localErrors, setLocalErrors] = useState<Record<number, { material_id?: string; quantity?: string; unit_price?: string }>>({});

    const handleAddItem = () => {
        onChange([...items, { material_id: '', quantity: 1, unit_price: '', isSaved: false }]);
    };

    const handleRemoveClick = (index: number) => {
        setItemIndexToDelete(index);
        setIsConfirmingDelete(true);
    };

    const handleItemChange = (index: number, field: keyof MaterialItem, value: MaterialItem[keyof MaterialItem]) => {
        const newItems = [...items];

        if (field === 'material_id') {
            newItems[index] = {
                ...newItems[index],
                material_id: value as string | number,
                unit_price: '',
            };
        } else {
            newItems[index] = {
                ...newItems[index],
                [field]: value,
            } as MaterialItem;
        }

        onChange(newItems);
    };

    const handleSaveRow = (index: number) => {
        const item = items[index];
        const errs: { material_id?: string; quantity?: string; unit_price?: string } = {};

        if (!item.material_id) {
            errs.material_id = 'Material selection is required.';
        }
        if (item.quantity === '' || Number(item.quantity) <= 0) {
            errs.quantity = 'Quantity must be greater than 0.';
        }
        if (item.unit_price === '' || Number(item.unit_price) <= 0) {
            errs.unit_price = 'Price is required and must be greater than 0.';
        }

        if (Object.keys(errs).length > 0) {
            setLocalErrors((prev) => ({ ...prev, [index]: errs }));
            return;
        }

        // Clear local errors for this row
        setLocalErrors((prev) => {
            const copy = { ...prev };
            delete copy[index];
            return copy;
        });

        const newItems = [...items];
        newItems[index] = { ...newItems[index], isSaved: true };
        onChange(newItems);
    };

    return (
        <div className="space-y-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800/50">
            <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold tracking-wider text-neutral-500 uppercase">Materials</h4>
                <button type="button" onClick={handleAddItem} className="flex items-center gap-1 text-xs font-semibold text-blue-600">
                    <Plus className="h-3 w-3" /> Add Item
                </button>
            </div>

            <div className="space-y-3">
                {items.map((item, index) => {
                    const isItemSaved = !!item.isSaved;
                    const selectedMaterial = materials.find((m) => m.id == item.material_id);
                    const materialLabel = selectedMaterial
                        ? selectedMaterial.unit
                            ? `${selectedMaterial.name} (${selectedMaterial.unit.short_name})`
                            : selectedMaterial.name
                        : 'Select Material';

                    const priceError = localErrors[index]?.unit_price || errors[`items.${index}.unit_price`];
                    const qtyError = localErrors[index]?.quantity || errors[`items.${index}.quantity`];
                    const materialError = localErrors[index]?.material_id || errors[`items.${index}.material_id`];

                    return (
                        <div
                            key={index}
                            className="relative rounded-lg border border-neutral-100 bg-white p-3 pr-12 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
                        >
                            {isItemSaved ? (
                                <div className="flex items-center justify-between gap-4 py-1">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">{materialLabel}</p>
                                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
                                            <span>
                                                Qty: <strong className="text-neutral-700 dark:text-neutral-300">{item.quantity}</strong>
                                            </span>
                                            <span>
                                                Price:{' '}
                                                <strong className="text-neutral-700 dark:text-neutral-300">
                                                    ৳{Number(item.unit_price).toFixed(2)}
                                                </strong>
                                            </span>
                                            <span>
                                                Total:{' '}
                                                <strong className="font-bold text-blue-600 dark:text-blue-400">
                                                    ৳{(Number(item.quantity) * Number(item.unit_price)).toFixed(2)}
                                                </strong>
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newItems = [...items];
                                            newItems[index] = { ...newItems[index], isSaved: false };
                                            onChange(newItems);
                                        }}
                                        className="flex items-center gap-1 rounded-lg bg-neutral-100 p-1.5 text-xs font-semibold text-neutral-600 transition-colors hover:text-blue-600 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:text-blue-400"
                                    >
                                        <Edit3 className="h-3.5 w-3.5" /> Edit
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="grid grid-cols-12 items-start gap-2">
                                        <div className="col-span-12 space-y-1 sm:col-span-6">
                                            <label className="text-[10px] font-bold text-neutral-400 uppercase">Material</label>
                                            <SearchableSelect
                                                options={materials.map((m) => ({
                                                    label: m.unit ? `${m.name} (${m.unit.short_name})` : m.name,
                                                    value: m.id,
                                                }))}
                                                value={item.material_id}
                                                onChange={(val) => handleItemChange(index, 'material_id', val)}
                                                placeholder="Select"
                                            />
                                            {materialError && <p className="mt-1 text-xs text-red-500">{materialError}</p>}
                                        </div>
                                        <div className="col-span-12 space-y-1 sm:col-span-3">
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
                                                className="h-12 w-full rounded-lg border border-neutral-200 bg-transparent px-2 text-xs sm:h-9 dark:border-neutral-800 dark:text-neutral-100"
                                                step="any"
                                                placeholder="Qty"
                                            />
                                            {qtyError && <p className="mt-1 text-xs text-red-500">{qtyError}</p>}
                                        </div>
                                        <div className="col-span-12 space-y-1 sm:col-span-3">
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
                                                className="h-12 w-full rounded-lg border border-neutral-200 bg-transparent px-2 text-xs sm:h-9 dark:border-neutral-800 dark:text-neutral-100"
                                                step="any"
                                                placeholder="0.00"
                                            />
                                            {priceError && <p className="mt-1 text-xs text-red-500">{priceError}</p>}
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-1">
                                        <button
                                            type="button"
                                            onClick={() => handleSaveRow(index)}
                                            className="flex items-center gap-1 rounded-lg bg-green-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                                        >
                                            <Check className="h-3.5 w-3.5" /> Save Row
                                        </button>
                                    </div>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => handleRemoveClick(index)}
                                className="absolute top-3 right-3 p-1.5 text-neutral-400 transition-colors hover:text-red-500"
                                title="Remove item"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    );
                })}

                {items.length === 0 && <p className="py-2 text-center text-[10px] text-neutral-400 italic">No items added</p>}
                {errors.items && <p className="text-xs text-red-500">{errors.items}</p>}
            </div>

            <DeleteConfirmationModal
                isOpen={isConfirmingDelete}
                onClose={() => {
                    setIsConfirmingDelete(false);
                    setItemIndexToDelete(null);
                }}
                onConfirm={() => {
                    if (itemIndexToDelete !== null) {
                        onChange(items.filter((_, i) => i !== itemIndexToDelete));
                    }
                    setIsConfirmingDelete(false);
                    setItemIndexToDelete(null);
                }}
                title="Remove Material Item"
                description="Are you sure you want to remove this material item from the list?"
                confirmText="Remove"
            />
        </div>
    );
}
