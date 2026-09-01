import AppLogoIcon from '@/components/app-logo-icon';
import { FormButton } from '@/components/ui/form-button';
import { FormInput } from '@/components/ui/form-input';
import { PasswordInput } from '@/components/ui/password-input';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function PortalLogin() {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('portal.login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-neutral-50 p-6 dark:bg-neutral-950">
            <Head title="Client Portal Login" />

            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl dark:bg-blue-900/20" />
                <div className="absolute -right-24 -bottom-32 h-96 w-96 rounded-full bg-blue-100/50 blur-3xl dark:bg-blue-950/30" />
            </div>

            <div className="relative w-full max-w-sm">
                <div className="mb-8 flex flex-col items-center gap-3 text-center">
                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                        <AppLogoIcon className="h-9 w-9 object-contain" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Client Portal</h1>
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Sign in to view your invoices and pricing</p>
                    </div>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-xl shadow-neutral-200/50 dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none">
                    <form className="flex flex-col gap-5" onSubmit={submit}>
                        <FormInput
                            id="username"
                            label="Username"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="username"
                            value={data.username}
                            onChange={(e) => setData('username', e.target.value)}
                            placeholder="your-username"
                            className="h-11 rounded-xl border-neutral-200 bg-transparent dark:border-neutral-800 dark:text-neutral-100"
                            error={errors.username}
                        />

                        <PasswordInput
                            id="password"
                            label="Password"
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Password"
                            className="h-11 rounded-xl border-neutral-200 bg-transparent dark:border-neutral-800 dark:text-neutral-100"
                            error={errors.password}
                        />

                        <FormButton type="submit" loading={processing} tabIndex={3} className="mt-1 w-full rounded-xl">
                            {processing ? 'Signing in...' : 'Log in'}
                        </FormButton>
                    </form>
                </div>
            </div>
        </div>
    );
}
