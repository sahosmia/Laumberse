import { FormInput } from '@/components/ui/form-input';
import { FormLabel } from '@/components/ui/form-label';
import { FormSelect } from '@/components/ui/form-select';
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
                <FormSelect id="month" label="Month" required value={data.month} onChange={(e) => setData('month', parseInt(e.target.value, 10))}>
                    {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                            {new Date(0, i).toLocaleString('default', { month: 'long' })}
                        </option>
                    ))}
                </FormSelect>
                <FormInput
                    id="year"
                    label="Year"
                    required
                    type="number"
                    value={data.year}
                    onChange={(e) => {
                        let val = e.target.value;
                        if (val.length > 1 && val.startsWith('0')) {
                            val = val.replace(/^0+/, '');
                        }
                        setData('year', val === '' ? '' : parseInt(val, 10));
                    }}
                    className="rounded-xl border-neutral-200 bg-transparent dark:border-neutral-800 dark:text-neutral-100"
                    error={errors.year}
                />
            </div>

            <div className="space-y-1">
                <FormLabel>Employee</FormLabel>
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
                        <FormInput
                            id="bonus"
                            label="Bonus"
                            type="number"
                            step="any"
                            value={data.bonus}
                            onChange={(e) => {
                                let val = e.target.value;
                                if (val.length > 1 && val.startsWith('0') && val[1] !== '.') {
                                    val = val.replace(/^0+/, '');
                                }
                                setData('bonus', val === '' ? '' : parseFloat(val));
                            }}
                            className="rounded-lg border-neutral-200 bg-transparent text-xs dark:border-neutral-800 dark:text-neutral-100"
                            error={errors.bonus}
                        />
                        <FormInput
                            id="deduction"
                            label="Deduction"
                            type="number"
                            step="any"
                            value={data.deduction}
                            onChange={(e) => {
                                let val = e.target.value;
                                if (val.length > 1 && val.startsWith('0') && val[1] !== '.') {
                                    val = val.replace(/^0+/, '');
                                }
                                setData('deduction', val === '' ? '' : parseFloat(val));
                            }}
                            className="rounded-lg border-neutral-200 bg-transparent text-xs dark:border-neutral-800 dark:text-neutral-100"
                            error={errors.deduction}
                        />
                    </div>
                    {typeof data.deduction === 'number' && data.deduction > 0 && (
                        <FormInput
                            id="deduction_note"
                            label="Deduction Note"
                            required
                            type="text"
                            value={data.deduction_note}
                            onChange={(e) => setData('deduction_note', e.target.value)}
                            className="rounded-lg border-neutral-200 bg-transparent text-xs dark:border-neutral-800 dark:text-neutral-100"
                            placeholder="Reason for deduction"
                            error={errors.deduction_note}
                        />
                    )}
                    <FormInput
                        id="note"
                        label="Note (Optional)"
                        type="text"
                        value={data.note}
                        onChange={(e) => setData('note', e.target.value)}
                        className="rounded-lg border-neutral-200 bg-transparent text-xs dark:border-neutral-800 dark:text-neutral-100"
                        placeholder="Shown on the employee's ledger for this payment"
                        error={errors.note}
                    />
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
