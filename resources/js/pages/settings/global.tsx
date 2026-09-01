import { type BreadcrumbItem, ExpenseCategory } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';

import { FormButton } from '@/components/ui/form-button';
import { FormInput } from '@/components/ui/form-input';
import { FormLabel } from '@/components/ui/form-label';
import { FormSelect } from '@/components/ui/form-select';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import type { GlobalSettingsValues } from '@/types/pages/settings';
import { Building2, CalendarDays, Image as ImageIcon, Plus, Settings, Workflow } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Global Settings',
        href: '/settings/global',
    },
];

const TABS = [
    { key: 'business', label: 'Business Information', icon: Building2 },
    { key: 'week', label: 'Business Week', icon: CalendarDays },
    { key: 'branding', label: 'Branding', icon: ImageIcon },
    { key: 'categories', label: 'Workflow Categories', icon: Workflow },
] as const;

type TabKey = (typeof TABS)[number]['key'];

const TAB_FIELDS: Record<TabKey, string[]> = {
    business: ['business_name', 'business_address', 'business_phone', 'business_email'],
    week: ['week_start_day'],
    branding: ['logo', 'favicon'],
    categories: [
        'salary_category_id',
        'material_expense_category_id',
        'asset_purchase_category_id',
        'business_transportation_category_id',
        'delivery_transportation_category_id',
    ],
};

export default function Global({ settings, expense_categories }: { settings: GlobalSettingsValues; expense_categories: ExpenseCategory[] }) {
    const [activeTab, setActiveTab] = useState<TabKey>('business');
    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        salary_category_id: settings.salary_category_id || '',
        material_expense_category_id: settings.material_expense_category_id || '',
        asset_purchase_category_id: settings.asset_purchase_category_id || '',
        business_transportation_category_id: settings.business_transportation_category_id || '',
        delivery_transportation_category_id: settings.delivery_transportation_category_id || '',
        business_name: settings.business_name || '',
        business_address: settings.business_address || '',
        business_phone: settings.business_phone || '',
        business_email: settings.business_email || '',
        week_start_day: settings.week_start_day,
        logo: null as File | null,
        favicon: null as File | null,
    });

    // A required field can end up on a tab that isn't showing when validation fails server-side
    // (e.g. a hidden required <select>'s native validation is skipped by the browser) — jump to
    // whichever tab actually holds the error so it's never silently invisible.
    useEffect(() => {
        const errorKeys = Object.keys(errors);
        if (errorKeys.length === 0 || TAB_FIELDS[activeTab].some((f) => errorKeys.includes(f))) return;
        const tabWithError = TABS.find((t) => TAB_FIELDS[t.key].some((f) => errorKeys.includes(f)));
        if (tabWithError) setActiveTab(tabWithError.key);
    }, [errors, activeTab]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('settings.global.update'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Global Settings" />

            <div className="space-y-4 p-4">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                        <Settings className="h-4 w-4" />
                    </div>
                    <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Global Settings</h1>
                </div>

                <form onSubmit={submit} className="max-w-2xl space-y-4">
                    <div className="inline-flex flex-wrap gap-1 rounded-xl border border-neutral-200 bg-neutral-100 p-1 dark:border-neutral-800 dark:bg-neutral-800/50">
                        {TABS.map(({ key, label, icon: Icon }) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setActiveTab(key)}
                                className={cn(
                                    'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
                                    activeTab === key
                                        ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-900 dark:text-neutral-100'
                                        : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300',
                                )}
                            >
                                <Icon className="h-4 w-4" /> {label}
                            </button>
                        ))}
                    </div>

                    <div
                        className={cn(
                            activeTab !== 'business' && 'hidden',
                            'rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900',
                        )}
                    >
                        <h2 className="mb-1 flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-neutral-100">
                            <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" /> Business Information
                        </h2>
                        <p className="mb-5 text-sm text-neutral-500 dark:text-neutral-400">Shown on invoices and the client portal</p>

                        <div className="space-y-4">
                            <FormInput
                                id="business_name"
                                label="Business Name"
                                value={data.business_name}
                                onChange={(e) => setData('business_name', e.target.value)}
                                className="rounded-xl border-neutral-200 bg-transparent dark:border-neutral-800 dark:text-neutral-100"
                                placeholder="e.g. Launverse"
                                error={errors.business_name}
                            />

                            <div className="space-y-1.5">
                                <FormLabel htmlFor="business_address">Business Address</FormLabel>
                                <textarea
                                    id="business_address"
                                    value={data.business_address}
                                    onChange={(e) => setData('business_address', e.target.value)}
                                    className="min-h-[80px] w-full rounded-xl border border-neutral-200 bg-transparent px-3 py-2 text-sm dark:border-neutral-800 dark:text-neutral-100"
                                    placeholder="e.g. House 12, Road 5, Dhaka, Bangladesh"
                                />
                                {errors.business_address && <p className="text-xs text-red-500">{errors.business_address}</p>}
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <FormInput
                                    id="business_phone"
                                    label="Phone"
                                    value={data.business_phone}
                                    onChange={(e) => setData('business_phone', e.target.value)}
                                    className="rounded-xl border-neutral-200 bg-transparent dark:border-neutral-800 dark:text-neutral-100"
                                    placeholder="+880 1234 567890"
                                    error={errors.business_phone}
                                />
                                <FormInput
                                    id="business_email"
                                    label="Email"
                                    type="email"
                                    value={data.business_email}
                                    onChange={(e) => setData('business_email', e.target.value)}
                                    className="rounded-xl border-neutral-200 bg-transparent dark:border-neutral-800 dark:text-neutral-100"
                                    placeholder="hello@launverse.com"
                                    error={errors.business_email}
                                />
                            </div>
                        </div>
                    </div>

                    <div
                        className={cn(
                            activeTab !== 'week' && 'hidden',
                            'rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900',
                        )}
                    >
                        <h2 className="mb-1 flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-neutral-100">
                            <CalendarDays className="h-4 w-4 text-blue-600 dark:text-blue-400" /> Business Week
                        </h2>
                        <p className="mb-5 text-sm text-neutral-500 dark:text-neutral-400">
                            Controls what "This Week" and "Previous Week" mean in every date filter across the app
                        </p>

                        <FormSelect
                            id="week_start_day"
                            label="Week Starts On"
                            required
                            value={data.week_start_day}
                            onChange={(e) => setData('week_start_day', Number(e.target.value))}
                            error={errors.week_start_day}
                        >
                            <option value={0}>Sunday</option>
                            <option value={1}>Monday</option>
                            <option value={2}>Tuesday</option>
                            <option value={3}>Wednesday</option>
                            <option value={4}>Thursday</option>
                            <option value={5}>Friday</option>
                            <option value={6}>Saturday</option>
                        </FormSelect>
                    </div>

                    <div
                        className={cn(
                            activeTab !== 'branding' && 'hidden',
                            'rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900',
                        )}
                    >
                        <h2 className="mb-1 flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-neutral-100">
                            <ImageIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" /> Branding
                        </h2>
                        <p className="mb-5 text-sm text-neutral-500 dark:text-neutral-400">
                            Logo appears on invoices and the sidebar; favicon appears in the browser tab
                        </p>

                        <div className="space-y-5">
                            <div className="space-y-1.5">
                                <FormLabel htmlFor="logo">Logo</FormLabel>
                                <div className="flex items-center gap-4">
                                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800">
                                        {data.logo ? (
                                            <img src={URL.createObjectURL(data.logo)} className="h-full w-full object-contain" />
                                        ) : settings.logo_url ? (
                                            <img src={settings.logo_url} className="h-full w-full object-contain" />
                                        ) : (
                                            <Plus className="h-6 w-6 text-neutral-400" />
                                        )}
                                    </div>
                                    <input
                                        id="logo"
                                        type="file"
                                        onChange={(e) => setData('logo', e.target.files?.[0] || null)}
                                        className="text-xs text-neutral-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-neutral-800 dark:file:text-neutral-300"
                                        accept="image/*"
                                    />
                                </div>
                                {errors.logo && <p className="text-xs text-red-500">{errors.logo}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <FormLabel htmlFor="favicon">Favicon</FormLabel>
                                <div className="flex items-center gap-4">
                                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800">
                                        {data.favicon ? (
                                            <img src={URL.createObjectURL(data.favicon)} className="h-full w-full object-contain" />
                                        ) : settings.favicon_url ? (
                                            <img src={settings.favicon_url} className="h-full w-full object-contain" />
                                        ) : (
                                            <Plus className="h-6 w-6 text-neutral-400" />
                                        )}
                                    </div>
                                    <input
                                        id="favicon"
                                        type="file"
                                        onChange={(e) => setData('favicon', e.target.files?.[0] || null)}
                                        className="text-xs text-neutral-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-neutral-800 dark:file:text-neutral-300"
                                        accept="image/*"
                                    />
                                </div>
                                {errors.favicon && <p className="text-xs text-red-500">{errors.favicon}</p>}
                            </div>
                        </div>
                    </div>

                    <div
                        className={cn(
                            activeTab !== 'categories' && 'hidden',
                            'rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900',
                        )}
                    >
                        <h2 className="mb-1 flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-neutral-100">
                            <Workflow className="h-4 w-4 text-blue-600 dark:text-blue-400" /> Workflow Categories
                        </h2>
                        <p className="mb-5 text-sm text-neutral-500 dark:text-neutral-400">Used to route expenses into the right dashboard metrics</p>

                        <div className="space-y-4">
                            <FormSelect
                                id="salary_category_id"
                                label="Salary Expense Category"
                                required
                                value={data.salary_category_id}
                                onChange={(e) => setData('salary_category_id', e.target.value)}
                                error={errors.salary_category_id}
                                helperText="Expenses in this category will trigger the payroll workflow."
                            >
                                <option value="">Select Category</option>
                                {expense_categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </FormSelect>

                            <FormSelect
                                id="material_expense_category_id"
                                label="Material Expense Category"
                                required
                                value={data.material_expense_category_id}
                                onChange={(e) => setData('material_expense_category_id', e.target.value)}
                                error={errors.material_expense_category_id}
                                helperText="Expenses in this category will trigger the material tracking workflow."
                            >
                                <option value="">Select Category</option>
                                {expense_categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </FormSelect>

                            <FormSelect
                                id="asset_purchase_category_id"
                                label="Asset Purchase Expense Category"
                                required
                                value={data.asset_purchase_category_id}
                                onChange={(e) => setData('asset_purchase_category_id', e.target.value)}
                                error={errors.asset_purchase_category_id}
                                helperText="Used when recording a new asset purchase from the Assets page."
                            >
                                <option value="">Select Category</option>
                                {expense_categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </FormSelect>

                            <FormSelect
                                id="business_transportation_category_id"
                                label="Business Transportation Expense Category"
                                required
                                value={data.business_transportation_category_id}
                                onChange={(e) => setData('business_transportation_category_id', e.target.value)}
                                error={errors.business_transportation_category_id}
                                helperText="Expenses in this category count toward Business Transportation cost."
                            >
                                <option value="">Select Category</option>
                                {expense_categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </FormSelect>

                            <FormSelect
                                id="delivery_transportation_category_id"
                                label="Delivery Transportation Expense Category"
                                required
                                value={data.delivery_transportation_category_id}
                                onChange={(e) => setData('delivery_transportation_category_id', e.target.value)}
                                error={errors.delivery_transportation_category_id}
                                helperText="Expenses in this category count toward Delivery Transportation cost."
                            >
                                <option value="">Select Category</option>
                                {expense_categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </FormSelect>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <FormButton loading={processing} type="submit">
                            {processing ? 'Saving...' : 'Save'}
                        </FormButton>

                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-in-out"
                            enterFrom="opacity-0"
                            leave="transition ease-in-out"
                            leaveTo="opacity-0"
                        >
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">Saved</p>
                        </Transition>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
