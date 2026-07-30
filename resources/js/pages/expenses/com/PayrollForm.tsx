import { SearchableSelect } from '@/components/ui/searchable-select';

interface EligibleEmployee {
    id: number;
    name: string;
    base_salary: number;
    already_paid: number;
    bonus: number;
    deduction: number;
    net_salary: number;
    status: string;
}

interface PayrollFormProps {
    data: {
        month: number;
        year: number;
        employee_id: string | number;
        bonus: number;
        deduction: number;
        deduction_note: string;
    };
    // Alignment with Inertia's useForm signature
    setData: <K extends keyof any>(key: K, value: any) => void;
    errors: Record<string, string | undefined>;
    eligibleEmployees: EligibleEmployee[];
    selectedEmployee: EligibleEmployee | null;
    netSalary: number;
    formatCurrency: (n: number | string) => string;
}

export function PayrollForm({
    data,
    setData,
    errors,
    eligibleEmployees,
    selectedEmployee,
    netSalary,
    formatCurrency,
}: PayrollFormProps) {
    return (
        <>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label htmlFor="month" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Month
                    </label>
                    <select
                        id="month"
                        value={data.month}
                        onChange={(e) => setData('month', parseInt(e.target.value, 10))}
                        className="w-full border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-sm bg-transparent dark:text-neutral-100"
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
                        className="w-full border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-sm bg-transparent dark:text-neutral-100"
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
                    onChange={(val) => setData('employee_id', val)}
                    placeholder="Select Employee"
                    error={errors.employee_id}
                />
            </div>

            {selectedEmployee && (
                <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-xl space-y-3">
                    <div className="flex justify-between text-xs">
                        <span className="text-neutral-500">Base Salary:</span>
                        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                            {formatCurrency(selectedEmployee.base_salary)}
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
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
                                className="w-full border border-neutral-200 dark:border-neutral-800 rounded-lg px-2 py-1.5 text-xs bg-transparent dark:text-neutral-100"
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
                                className="w-full border border-neutral-200 dark:border-neutral-800 rounded-lg px-2 py-1.5 text-xs bg-transparent dark:text-neutral-100"
                                step="any"
                            />
                        </div>
                    </div>
                    {data.deduction > 0 && (
                        <div className="space-y-1">
                            <label htmlFor="deduction_note" className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                                Deduction Note
                            </label>
                            <input
                                id="deduction_note"
                                type="text"
                                value={data.deduction_note}
                                onChange={(e) => setData('deduction_note', e.target.value)}
                                className="w-full border border-neutral-200 dark:border-neutral-800 rounded-lg px-2 py-1.5 text-xs bg-transparent dark:text-neutral-100"
                                required
                                placeholder="Reason for deduction"
                            />
                            {errors.deduction_note && <p className="text-xs text-red-500">{errors.deduction_note}</p>}
                        </div>
                    )}
                    <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
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
