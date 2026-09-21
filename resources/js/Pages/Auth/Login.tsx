import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
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

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full rounded-xl border-slate-300 bg-slate-50 px-4 py-3 text-base text-slate-800 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                            autoComplete="current-password"
                            placeholder="Masukkan password"
                            onChange={(e) => setData('password', e.target.value)}
                        />

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
