import { type BreadcrumbItem, ExpenseCategory } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Global settings',
        href: '/settings/global',
    },
];

export default function Global({ settings, expense_categories }: { settings: { salary_category_id: string | number }, expense_categories: ExpenseCategory[] }) {
    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        salary_category_id: settings.salary_category_id || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('settings.global.update'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Global settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Global settings" description="Manage system-wide configurations" />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="salary_category_id">Salary Expense Category</Label>

                            <select
                                id="salary_category_id"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={data.salary_category_id}
                                onChange={(e) => setData('salary_category_id', e.target.value)}
                                required
                            >
                                <option value="">Select Category</option>
                                {expense_categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>

                            <p className="text-xs text-neutral-500">Expenses in this category will trigger the payroll workflow.</p>

                            <InputError className="mt-2" message={errors.salary_category_id} />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>Save</Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">Saved</p>
                            </Transition>
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
