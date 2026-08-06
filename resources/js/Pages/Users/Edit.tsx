import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEvent } from 'react';

type UnitOption = {
    id: number;
    name: string;
};

type SupervisorOption = {
    id: number;
    name: string;
};

type ManagedUser = {
    id: number;
    name: string;
    username: string;
    employee_id?: string | null;
    email?: string | null;
    unit_id?: number | null;
    role?: string | null;
    supervisor_id?: number | null;
    is_active?: boolean;
};

type Props = PageProps<{
    user: ManagedUser;
    units: UnitOption[];
    isAdminUnit: boolean;
    isSupervisor: boolean;
    supervisors: SupervisorOption[];
    currentUserId: number;
    currentUserTeam: string | null;
}>;

export default function UsersEdit({ user, units, isAdminUnit, isSupervisor, supervisors, currentUserTeam }: Props) {
    const { flash } = usePage<PageProps<{ flash?: { success?: string; error?: string } }>>()
        .props;

    const { data, setData, patch, processing, errors } = useForm({
        name: user.name ?? '',
        username: user.username ?? '',
        employee_id: user.employee_id ?? '',
        email: user.email ?? '',
        unit_id: user.unit_id ? String(user.unit_id) : '',
        role: user.role ?? 'member',
        supervisor_id: user.supervisor_id ? String(user.supervisor_id) : '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        patch(route('users.update', user.id));
    };

    const getRoleOptions = () => {
        if (isSupervisor) {
            const team = currentUserTeam ?? 'IT';
            return [
                { value: 'member', label: 'Member' },
                { value: 'it', label: 'IT' },
                { value: 'ipsrs', label: 'IPSRS' },
            ].filter(opt => opt.value === 'member' || opt.value === team.toLowerCase());
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
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-xl font-semibold text-slate-900">
                            Edit User
                        </div>
                        <div className="mt-1 text-sm text-slate-600">
                            Username: {user.username}
                        </div>
                    </div>
                    <Link
                        href={route('users.index')}
                        className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-50"
                    >
                        Kembali
                    </Link>
                </div>
            }
        >
            <Head title="Edit User" />

            <div className="py-8">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                            {flash.error}
                        </div>
                    )}

                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        <form onSubmit={submit} className="space-y-5">
                            <div>
                                <InputLabel htmlFor="name" value="Nama" />
                                <TextInput
                                    id="name"
                                    className="mt-1 block w-full"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="username" value="Username" />
                                <TextInput
                                    id="username"
                                    className="mt-1 block w-full"
                                    value={data.username}
                                    onChange={(e) => setData('username', e.target.value)}
                                    required
                                />
                                <InputError message={errors.username} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="employee_id" value="NIP / ID Karyawan" />
                                <TextInput
                                    id="employee_id"
                                    className="mt-1 block w-full"
                                    value={data.employee_id}
                                    onChange={(e) => setData('employee_id', e.target.value)}
                                />
                                <InputError message={errors.employee_id} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="email" value="Email (opsional)" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    className="mt-1 block w-full"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            {isAdminUnit && (
                                <div>
                                    <InputLabel htmlFor="unit" value="Unit / Departemen" />
                                    <select
                                        id="unit"
                                        value={data.unit_id}
                                        onChange={(e) => setData('unit_id', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    >
                                        <option value="">-- Pilih Unit --</option>
                                        {units.map((u) => (
                                            <option key={u.id} value={String(u.id)}>
                                                {u.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.unit_id} className="mt-2" />
                                </div>
                            )}

                            <div>
                                <InputLabel htmlFor="role" value="Role" />
                                <select
                                    id="role"
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    {getRoleOptions().map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.role} className="mt-2" />
                            </div>

                            {isAdminUnit && (
                                <div>
                                    <InputLabel htmlFor="supervisor" value="Supervisor" />
                                    <select
                                        id="supervisor"
                                        value={data.supervisor_id}
                                        onChange={(e) => setData('supervisor_id', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="password" value="Password (opsional)" />
                                    <TextInput
                                        id="password"
                                        type="password"
                                        className="mt-1 block w-full"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                    />
                                    <InputError message={errors.password} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel
                                        htmlFor="password_confirmation"
                                        value="Konfirmasi Password"
                                    />
                                    <TextInput
                                        id="password_confirmation"
                                        type="password"
                                        className="mt-1 block w-full"
                                        value={data.password_confirmation}
                                        onChange={(e) =>
                                            setData('password_confirmation', e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <PrimaryButton disabled={processing}>
                                    Simpan
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
