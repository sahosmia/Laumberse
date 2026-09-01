import { FormButton } from '@/components/ui/form-button';
import { PasswordInput } from '@/components/ui/password-input';
import ClientPortalLayout from '@/layouts/client-portal-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function PortalPassword() {
    const { flash } = usePage<{ flash?: { success?: string } }>().props;

    const { data, setData, put, processing, errors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('portal.password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <ClientPortalLayout>
            <Head title="Change Password" />
            <div className="mx-auto max-w-md space-y-4">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Change Password</h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Update the password used to sign in to the portal</p>
                </div>

                {flash?.success && (
                    <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                        {flash.success}
                    </div>
                )}

                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <form onSubmit={submit} className="space-y-4">
                        <PasswordInput
                            id="current_password"
                            label="Current Password"
                            required
                            autoComplete="current-password"
                            value={data.current_password}
                            onChange={(e) => setData('current_password', e.target.value)}
                            className="rounded-xl border-neutral-200 bg-transparent dark:border-neutral-800 dark:text-neutral-100"
                            error={errors.current_password}
                        />
                        <PasswordInput
                            id="password"
                            label="New Password"
                            required
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="rounded-xl border-neutral-200 bg-transparent dark:border-neutral-800 dark:text-neutral-100"
                            error={errors.password}
                        />
                        <PasswordInput
                            id="password_confirmation"
                            label="Confirm New Password"
                            required
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            className="rounded-xl border-neutral-200 bg-transparent dark:border-neutral-800 dark:text-neutral-100"
                            error={errors.password_confirmation}
                        />

                        <FormButton type="submit" loading={processing} className="w-full rounded-xl">
                            {processing ? 'Saving...' : 'Update Password'}
                        </FormButton>
                    </form>
                </div>
            </div>
        </ClientPortalLayout>
    );
}
