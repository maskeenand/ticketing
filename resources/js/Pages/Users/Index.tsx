import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';

type Unit = {
    id: number;
    name: string;
    code: string;
} | null;

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Paginated<T> = {
    data: T[];
    links: PaginationLink[];
};

type ManagedUser = {
    id: number;
    name: string;
    username?: string | null;
    employee_id?: string | null;
    email: string;
    role?: string | null;
    team?: string | null;
    is_active?: boolean;
    unit?: { id: number; name: string } | null;
    supervisor?: { id: number; name: string } | null;
};

type Props = PageProps<{
    unit: Unit;
    users: Paginated<ManagedUser>;
    isAdminUnit: boolean;
    isSupervisor: boolean;
    currentUserId: number;
}>;

function roleLabel(role?: string | null) {
    if (role === 'admin') return 'Admin';
    if (role === 'it') return 'IT';
    if (role === 'ipsrs') return 'IPSRS';
    if (role === 'supervisor') return 'Supervisor';
    return 'Member';
}

export default function UsersIndex({ unit, users, isAdminUnit, isSupervisor, currentUserId }: Props) {
    const { flash } = usePage<PageProps<{ flash?: { success?: string; error?: string } }>>()
        .props;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-xl font-semibold text-slate-900">
                            Users
                        </div>
                        <div className="mt-1 text-sm text-slate-600">
                            Unit: {unit?.name ?? 'Semua'}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('users.create')}
                            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                        >
                            Create User
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Users" />

            <div className="py-8">
                <div className="w-full max-w-none px-4 sm:px-6 lg:px-8">
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

                    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Nama
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Username
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Unit
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        NIP / ID
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Email
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Role
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Team
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Supervisor
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {users.data.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                                            {u.name}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-700">
                                            {u.username ?? '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-700">
                                            {u.unit?.name ?? '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-700">
                                            {u.employee_id ?? '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-700">
                                            {u.email}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-700">
                                            {roleLabel(u.role)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-700">
                                            {u.team ?? '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-700">
                                            {u.supervisor?.name ?? '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm">
                                            <div className="inline-flex items-center gap-2">
                                                <Link
                                                    href={route('users.edit', u.id)}
                                                    className="rounded p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                                    aria-label="Edit"
                                                    title="Edit"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="1.5"
                                                        className="h-5 w-5"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M16.862 3.487a2.25 2.25 0 013.182 3.182L8.25 18.463l-4.5 1.125 1.125-4.5L16.862 3.487z"
                                                        />
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M15.75 4.5l3.75 3.75"
                                                        />
                                                    </svg>
                                                </Link>
                                                {(!isSupervisor || u.id !== currentUserId) && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            router.patch(
                                                                route('users.toggleActive', u.id),
                                                                {},
                                                                { preserveScroll: true },
                                                            )
                                                        }
                                                        className={
                                                            'rounded p-2 hover:bg-slate-100 ' +
                                                            (u.is_active === false
                                                                ? 'text-emerald-600 hover:text-emerald-700'
                                                                : 'text-rose-600 hover:text-rose-700')
                                                        }
                                                        aria-label={u.is_active === false ? 'Aktifkan' : 'Nonaktifkan'}
                                                        title={u.is_active === false ? 'Aktifkan' : 'Nonaktifkan'}
                                                    >
                                                        {u.is_active === false ? (
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="1.5"
                                                                className="h-5 w-5"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M9 12.75L11.25 15l3.75-3.75"
                                                                />
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z"
                                                                />
                                                            </svg>
                                                        ) : (
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="1.5"
                                                                className="h-5 w-5"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M18.364 5.636L5.636 18.364"
                                                                />
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M12 21c4.97 0-9-4.03-9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9z"
                                                                />
                                                            </svg>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {users.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={9}
                                            className="px-4 py-10 text-center text-sm text-slate-500"
                                        >
                                            Belum ada user.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        {users.links.map((l, idx) => (
                            <Link
                                key={`${idx}-${l.label}`}
                                href={l.url ?? '#'}
                                className={
                                    'rounded-md px-3 py-2 text-sm ' +
                                    (l.active
                                        ? 'bg-slate-900 text-white'
                                        : l.url
                                          ? 'bg-white text-slate-700 hover:bg-slate-100'
                                          : 'bg-white text-slate-300')
                                }
                                disabled={!l.url}
                                preserveScroll
                            >
                                <span
                                    dangerouslySetInnerHTML={{ __html: l.label }}
                                />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
