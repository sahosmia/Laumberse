import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import AppLogoIcon from '@/components/app-logo-icon';
import { Checkbox } from '@/components/ui/checkbox';
import { FormButton } from '@/components/ui/form-button';
import { FormInput } from '@/components/ui/form-input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import type { LoginForm, LoginProps } from '@/types/pages/auth';

export default function Login({ status }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-neutral-50 p-6 dark:bg-neutral-950">
            <Head title="Log in" />

            {/* Ambient background */}
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
                        <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Launverse</h1>
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Sign in to your admin account</p>
                    </div>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-xl shadow-neutral-200/50 dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none">
                    <form className="flex flex-col gap-5" onSubmit={submit}>
                        <FormInput
                            id="email"
                            type="email"
                            label="Email address"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="email@example.com"
                            className="h-11 rounded-xl border-neutral-200 bg-transparent dark:border-neutral-800 dark:text-neutral-100"
                            error={errors.email}
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

                        <div className="flex items-center space-x-3">
                            <Checkbox
                                id="remember"
                                name="remember"
                                tabIndex={3}
                                checked={data.remember}
                                onCheckedChange={(checked) => setData('remember', checked === true)}
                            />
                            <Label htmlFor="remember" className="cursor-pointer font-normal text-neutral-600 dark:text-neutral-400">
                                Remember me
                            </Label>
                        </div>

                        <FormButton type="submit" loading={processing} tabIndex={4} className="mt-1 w-full rounded-xl">
                            {processing ? 'Signing in...' : 'Log in'}
                        </FormButton>
                    </form>

                    {status && (
                        <div className="mt-4 rounded-xl bg-green-50 px-3 py-2 text-center text-sm font-medium text-green-600 dark:bg-green-900/20 dark:text-green-400">
                            {status}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
