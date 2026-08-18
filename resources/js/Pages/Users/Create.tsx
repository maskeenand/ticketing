import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEvent } from 'react';

type Unit = {
    id: number;
    name: string;
    code: string;
} | null;

type UnitOption = {
    id: number;
    name: string;
};

type SupervisorOption = {
    id: number;
    name: string;
};

type Props = PageProps<{
    unit: Unit;
    units: UnitOption[];
    isAdminUnit: boolean;
    isSupervisor: boolean;
    supervisors: SupervisorOption[];
    currentUserId: number;
    currentUserTeam: string | null;
}>;

export default function UsersCreate({
    unit,
    units,
    isAdminUnit,
    isSupervisor,
    supervisors,
    currentUserId,
    currentUserTeam,
}: Props) {
    const { flash } = usePage<PageProps<{ flash?: { success?: string; error?: string } }>>()
        .props;

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        username: '',
        email: '',
        unit_id: unit?.id ? String(unit.id) : '',
        role: isSupervisor ? 'member' : 'member',
        supervisor_id: isSupervisor ? String(currentUserId) : '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('users.store'), { showProgress: false });
    };

    const getRoleOptions = () => {
        if (isSupervisor) {
            const team = currentUserTeam?.toLowerCase();
            return [
                { value: 'member', label: 'Member' },
                { value: 'it', label: 'IT' },
                { value: 'ipsrs', label: 'IPSRS' },
            ].filter((opt) => opt.value === 'member' || opt.value === team);
        }
        return [
            { value: 'member', label: 'Member' },
            { value: 'admin', label: 'Admin' },
            { value: 'it', label: 'IT' },
            { value: 'ipsrs', label: 'IPSRS' },
            { value: 'supervisor', label: 'Supervisor' },
        ];
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg shadow-teal-500/30">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6 text-white">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m10.117 0a8.966 8.966 0 00-5.059-1.772c-1.963 0-3.79.634-5.058 1.772m0 0a5.971 5.971 0 00-.941 3.197m0 0A8.97 8.97 0 003 18.239a9.094 9.094 0 003.741.479m0-10.173a3 3 0 013.196-3.196 3 3 0 013.196 3.196 3 3 0 01-3.196 3.196 3 3 0 01-3.196-3.196zm10.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-900">
                                Create User
                            </div>
                            <div className="mt-1 text-sm text-slate-500">
                                Tambahkan pengguna baru ke sistem • Unit: <span className="font-semibold text-teal-600">{unit?.name ?? '-'}</span>
                            </div>
                        </div>
                    </div>
                    <Link
                        href={route('users.index')}
                        className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-gradient-to-r from-white to-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:from-slate-50 hover:to-slate-100 hover:border-slate-300 hover:shadow-md"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                        Kembali
                    </Link>
                </div>
            }
        >
            <Head title="Create User" />

            <div className="py-8">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    {flash?.error && (
                        <div className="mb-6 rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50 to-pink-50 px-6 py-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-semibold text-rose-800">Gagal Menyimpan</div>
                                    <div className="mt-1 text-sm text-rose-700">{flash.error}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
                        <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-bl from-teal-100 to-cyan-100 opacity-60 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 h-40 w-40 bg-gradient-to-tr from-blue-100 to-indigo-100 opacity-60 blur-3xl"></div>
                        
                        <div className="relative px-8 pt-8 pb-6 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-100 to-cyan-100 text-teal-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Informasi Pengguna</h3>
                                    <p className="text-sm text-slate-500">Isi data pengguna dengan lengkap dan jelas</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={submit} className="relative px-8 pb-8 pt-6 space-y-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="name" value="Nama Lengkap" />
                                    <TextInput
                                        id="name"
                                        className="mt-2 block w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-900 placeholder-slate-400 shadow-sm transition-all duration-200 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        placeholder="Masukkan nama lengkap"
                                        required
                                    />
                                    <InputError
                                        message={errors.name}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="username" value="Username" />
                                    <TextInput
                                        id="username"
                                        className="mt-2 block w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-900 placeholder-slate-400 shadow-sm transition-all duration-200 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20"
                                        value={data.username}
                                        onChange={(e) =>
                                            setData('username', e.target.value)
                                        }
                                        placeholder="Masukkan username"
                                        required
                                    />
                                    <InputError
                                        message={errors.username}
                                        className="mt-2"
                                    />
                                </div>
                            </div>

                            <div>
                                <InputLabel htmlFor="email" value="Email" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    className="mt-2 block w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-900 placeholder-slate-400 shadow-sm transition-all duration-200 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    placeholder="email@example.com (opsional)"
                                />
                                <InputError
                                    message={errors.email}
                                    className="mt-2"
                                />
                            </div>

                            {isAdminUnit && (
                                <div>
                                    <InputLabel htmlFor="unit" value="Unit / Departemen" />
                                    <select
                                        id="unit"
                                        value={data.unit_id}
                                        onChange={(e) =>
                                            setData('unit_id', e.target.value)
                                        }
                                        className="mt-2 block w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-900 shadow-sm transition-all duration-200 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20"
                                        required
                                    >
                                        <option value="">-- Pilih Unit --</option>
                                        {units.map((u) => (
                                            <option key={u.id} value={String(u.id)}>
                                                {u.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError
                                        message={errors.unit_id}
                                        className="mt-2"
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="role" value="Role" />
                                    <select
                                        id="role"
                                        value={data.role}
                                        onChange={(e) =>
                                            setData('role', e.target.value)
                                        }
                                        className="mt-2 block w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-900 shadow-sm transition-all duration-200 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20"
                                    >
                                        {getRoleOptions().map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError
                                        message={errors.role}
                                        className="mt-2"
                                    />
                                </div>

                                {isAdminUnit && (
                                    <div>
                                        <InputLabel htmlFor="supervisor" value="Supervisor" />
                                        <select
                                            id="supervisor"
                                            value={data.supervisor_id}
                                            onChange={(e) =>
                                                setData('supervisor_id', e.target.value)
                                            }
                                            className="mt-2 block w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-900 shadow-sm transition-all duration-200 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20"
                                        >
                                            <option value="">-- Pilih Supervisor --</option>
                                            {supervisors.map((s) => (
                                                <option key={s.id} value={String(s.id)}>
                                                    {s.name}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError
                                            message={errors.supervisor_id}
                                            className="mt-2"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-900">Keamanan Akun</h4>
                                        <p className="text-xs text-slate-500">Password default: <span className="font-semibold text-amber-700">password</span> • Pengguna harus mengganti password pada saat login pertama</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-6">
                                <PrimaryButton disabled={processing} className="px-8 py-3 text-base rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 shadow-lg shadow-teal-500/30 transition-all duration-200">
                                    {processing ? (
                                        <div className="flex items-center gap-2">
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                            Menyimpan...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                            Simpan Pengguna
                                        </div>
                                    )}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
