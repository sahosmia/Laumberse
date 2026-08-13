import { SearchableSelect } from '@/components/ui/searchable-select';
import type { PayrollFormProps } from '@/types/pages/expenses';

export function PayrollForm({
    data,
    setData,
    errors,
    eligibleEmployees,
    selectedEmployee,
    netSalary,
    formatCurrency,
    onEmployeeChange,
}: PayrollFormProps) {
    return (
        <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                    <label htmlFor="month" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Month
                    </label>
                    <select
                        id="month"
                        value={data.month}
                        onChange={(e) => setData('month', parseInt(e.target.value, 10))}
                        className="h-12 w-full rounded-xl border border-neutral-200 bg-transparent px-3 text-sm md:h-10 dark:border-neutral-800 dark:text-neutral-100"
                        required
                    >
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                                {new Date(0, i).toLocaleString('default', { month: 'long' })}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="space-y-1">
                    <label htmlFor="year" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Year
                    </label>
                    <input
                        id="year"
                        type="number"
                        value={data.year}
                        onChange={(e) => setData('year', parseInt(e.target.value, 10))}
                        className="h-12 w-full rounded-xl border border-neutral-200 bg-transparent px-3 text-sm md:h-10 dark:border-neutral-800 dark:text-neutral-100"
                        required
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Employee</label>
                <SearchableSelect
                    options={eligibleEmployees.map((e) => ({
                        label: `${e.name} (Base: ${e.base_salary})`,
                        value: e.id,
                    }))}
                    value={data.employee_id}
                    onChange={onEmployeeChange}
                    placeholder="Select Employee"
                    error={errors.employee_id}
                />
            </div>

            {selectedEmployee && (
                <div className="space-y-3 rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800/50">
                    <div className="flex justify-between text-xs">
                        <span className="text-neutral-500">Base Salary:</span>
                        <span className="font-semibold text-neutral-900 dark:text-neutral-100">{formatCurrency(selectedEmployee.base_salary)}</span>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <label htmlFor="bonus" className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                                Bonus
                            </label>
                            <input
                                id="bonus"
                                type="number"
                                value={data.bonus}
                                onChange={(e) => {
                                    let val = e.target.value;
                                    if (val.length > 1 && val.startsWith('0') && val[1] !== '.') {
                                        val = val.replace(/^0+/, '');
                                    }
                                    setData('bonus', val === '' ? '' : parseFloat(val));
                                }}
                                className="h-12 w-full rounded-lg border border-neutral-200 bg-transparent px-2 text-xs sm:h-9 dark:border-neutral-800 dark:text-neutral-100"
                                step="any"
                            />
                        </div>
                        <div className="space-y-1">
                            <label htmlFor="deduction" className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                                Deduction
                            </label>
                            <input
                                id="deduction"
                                type="number"
                                value={data.deduction}
                                onChange={(e) => {
                                    let val = e.target.value;
                                    if (val.length > 1 && val.startsWith('0') && val[1] !== '.') {
                                        val = val.replace(/^0+/, '');
                                    }
                                    setData('deduction', val === '' ? '' : parseFloat(val));
                                }}
                                className="h-12 w-full rounded-lg border border-neutral-200 bg-transparent px-2 text-xs sm:h-9 dark:border-neutral-800 dark:text-neutral-100"
                                step="any"
                            />
                        </div>
                    </div>
                    {typeof data.deduction === 'number' && data.deduction > 0 && (
                        <div className="space-y-1">
                            <label htmlFor="deduction_note" className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                                Deduction Note
                            </label>
                            <input
                                id="deduction_note"
                                type="text"
                                value={data.deduction_note}
                                onChange={(e) => setData('deduction_note', e.target.value)}
                                className="h-12 w-full rounded-lg border border-neutral-200 bg-transparent px-2 text-xs sm:h-9 dark:border-neutral-800 dark:text-neutral-100"
                                required
                                placeholder="Reason for deduction"
                            />
                            {errors.deduction_note && <p className="text-xs text-red-500">{errors.deduction_note}</p>}
                        </div>
                    )}
                    <div className="flex items-center justify-between border-t border-neutral-200 pt-2 dark:border-neutral-700">
                        <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Net Salary:</span>
                        <span className="text-sm font-bold text-blue-600">{formatCurrency(netSalary)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-neutral-500 italic">
                        <span>Already Paid: {formatCurrency(selectedEmployee.already_paid)}</span>
                        <span>Remaining: {formatCurrency(netSalary - selectedEmployee.already_paid)}</span>
                    </div>
                </div>
            )}
        </>
    );
}
