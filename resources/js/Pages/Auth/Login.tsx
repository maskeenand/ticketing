import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Masuk" />

            <div className="space-y-7">
                <div className="text-center">
                    <h1 className="text-[2.2rem] font-bold tracking-tight text-slate-800">
                        Selamat Datang
                    </h1>
                </div>

                <div className="rounded-xl border-2 border-[#5fc79f] bg-[#f2fff7] px-4 py-3 text-center shadow-sm shadow-emerald-100/70">
                    <p className="text-sm font-medium text-[#1f7b60]">
                        Masuk Ke Akun Ticketing Anda
                    </p>
                </div>

                {status && (
                    <div className="rounded-2xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700 shadow-sm shadow-emerald-200/50">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-5 pt-2">
                    <div>
                        <InputLabel htmlFor="username" value="Username" className="text-sm font-medium text-slate-700" />

                        <TextInput
                            id="username"
                            type="text"
                            name="username"
                            value={data.username}
                            className="mt-1 block w-full rounded-xl border-slate-300 bg-slate-50 px-4 py-3 text-base text-slate-800 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                            autoComplete="username"
                            placeholder="Masukkan username"
                            isFocused={true}
                            onChange={(e) => setData('username', e.target.value)}
                        />

                        <InputError message={errors.username} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="password" value="Password" className="text-sm font-medium text-slate-700" />

                        <div className="relative mt-1">
                            <TextInput
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={data.password}
                                className="block w-full rounded-xl border-slate-300 bg-slate-50 px-4 py-3 pr-12 text-base text-slate-800 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                                autoComplete="current-password"
                                placeholder="Masukkan password"
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((visible) => !visible)}
                                className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center rounded-r-xl text-slate-500 transition hover:text-teal-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500"
                                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                                aria-pressed={showPassword}
                                title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
                                        <path d="M3 3l18 18" />
                                        <path d="M10.6 10.6a2 2 0 002.8 2.8" />
                                        <path d="M9.9 5.2A10.8 10.8 0 0112 5c5 0 8.5 4.5 9.5 7-.4 1-1.3 2.2-2.5 3.3" />
                                        <path d="M6.2 6.2C4.2 7.5 2.9 9.5 2.5 12c.8 2.3 4.4 7 9.5 7 1.3 0 2.5-.3 3.5-.8" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
                                        <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
                        <label className="flex items-center gap-2 text-sm text-slate-600">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={(e) =>
                                    setData('remember', e.target.checked || false)
                                }
                            />
                            Ingat saya
                        </label>

                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-sm font-medium text-teal-600 transition hover:text-teal-700"
                            >
                                Lupa password?
                            </Link>
                        )}
                    </div>

                    <PrimaryButton
                        className="mt-2 w-full justify-center rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-5 py-3 text-base font-bold text-white shadow-lg shadow-teal-500/30 hover:from-teal-600 hover:to-cyan-600"
                        disabled={processing}
                    >
                        Masuk ke Sistem
                    </PrimaryButton>
                </form>
            </div>
        </GuestLayout>
    );
}
