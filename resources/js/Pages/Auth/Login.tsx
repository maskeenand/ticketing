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

            <div className="space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                        Selamat Datang
                    </h1>
                    <div className="mt-4 rounded-lg border-2 border-green-500 bg-green-50 px-4 py-3">
                        <p className="text-sm font-medium text-green-700">
                            Masuk Ke Akun Ticketing Anda
                        </p>
                    </div>
                </div>

                <div className="rounded-[1.75rem] border border-slate-200/80 bg-white p-8 shadow-2xl shadow-slate-900/10">
                    {status && (
                        <div className="mb-6 rounded-2xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700 shadow-sm shadow-emerald-200/50">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <InputLabel htmlFor="username" value="Username" />

                            <TextInput
                                id="username"
                                type="text"
                                name="username"
                                value={data.username}
                                className="mt-1 block w-full"
                                autoComplete="username"
                                placeholder="Masukkan username"
                                isFocused={true}
                                onChange={(e) => setData('username', e.target.value)}
                            />

                            <InputError message={errors.username} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password" value="Password" />

                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-1 block w-full"
                                autoComplete="current-password"
                                placeholder="Masukkan password"
                                onChange={(e) => setData('password', e.target.value)}
                            />

                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

                        <PrimaryButton className="w-full text-center" disabled={processing}>
                            Masuk ke Sistem
                        </PrimaryButton>
                    </form>
                </div>
            </div>
        </GuestLayout>
    );
}
