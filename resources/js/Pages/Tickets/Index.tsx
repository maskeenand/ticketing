import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import DatePicker from '@/Components/DatePicker';
import { PageProps } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import JoditEditor from 'jodit-react';
import { FormEvent, useState } from 'react';

type TicketStatus = 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';

type Project = {
    id: number;
    name: string;
};

type Person = {
    id: number;
    name: string;
};

type Ticket = {
    id: number;
    code: string;
    title: string;
    description?: string | null;
    status: TicketStatus;
    priority: 'low' | 'medium' | 'high';
    created_at: string;
    project: Project | null;
    requester?: Person | null;
    assignee?: Person | null;
    category?: string | null;
    type?: string | null;
    last_replied_by?: string | null;
    last_replied_at?: string | null;
    feedback_rating?: number | null;
    attachments_count?: number;
    comments_count?: number;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Paginated<T> = {
    data: T[];
    links: PaginationLink[];
};

type Filters = {
    view: 'table' | 'card';
    status: TicketStatus | null;
    period_start: string | null;
    period_end: string | null;
    q: string | null;
    category?: 'IT' | 'IPSRS' | null;
    project_id: number | null;
    created_by?: number | null;
    raised_by?: number | null;
    view_mode?: 'personal' | 'client';
};

type Props = PageProps<{
    filters: Filters;
    tickets: Paginated<Ticket>;
    projects: Project[];
    statusCounts: Record<TicketStatus, number>;
    createdByUsers: Person[];
    raisedByUsers: Person[];
    canEdit: boolean;
    availableAssignees: Person[];
}>;

function priorityLabel(priority: Ticket['priority']) {
    if (priority === 'high') return 'High Priority';
    if (priority === 'low') return 'Low Priority';
    return 'Medium Priority';
}

function priorityIconClass(priority: Ticket['priority']) {
    if (priority === 'high') return 'bg-rose-600';
    if (priority === 'low') return 'bg-emerald-500';
    return 'bg-slate-600';
}

function statusLabel(status: TicketStatus) {
    if (status === 'open') return 'Open';
    if (status === 'in_progress') return 'In Progress';
    if (status === 'pending') return 'Pending';
    if (status === 'resolved') return 'Review';
    return 'Closed';
}

function statusPillClass(status: TicketStatus) {
    if (status === 'open') return 'bg-rose-500 text-white';
    if (status === 'in_progress') return 'bg-indigo-500 text-white';
    if (status === 'pending') return 'bg-amber-500 text-white';
    if (status === 'resolved') return 'bg-emerald-500 text-white';
    return 'bg-slate-500 text-white';
}

function ticketCodeShort(code: string) {
    if (/^(TKT|IT|IPS)(?:IT|IPS)?-?/.test(code)) {
        return code.replace(/^(TKT|IT|IPS)(?:IT|IPS)?-?/, '');
    }
    return code;
}

function formatDateShort(value: string) {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: '2-digit' });
}

function formatDateTime(value: string) {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleString('id-ID');
}

function timeAgo(value: string) {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '-';
    const diffMs = Date.now() - d.getTime();
    const diffSec = Math.max(0, Math.floor(diffMs / 1000));
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);
    if (diffYear >= 1) return `${diffYear} tahun yang lalu`;
    if (diffMonth >= 1) return `${diffMonth} bulan yang lalu`;
    if (diffDay >= 1) return `${diffDay} hari yang lalu`;
    if (diffHour >= 1) return `${diffHour} jam yang lalu`;
    if (diffMin >= 1) return `${diffMin} menit yang lalu`;
    return 'baru saja';
}

function ticketSubtitle(status: TicketStatus) {
    if (status === 'open') return 'Permintaan Baru';
    if (status === 'in_progress') return 'Sedang Dikerjakan';
    if (status === 'pending') return 'Menunggu';
    if (status === 'resolved') return 'Review (Menunggu Konfirmasi)';
    return 'Closed';
}

function typePillClass(type: string | null | undefined) {
    // Warna untuk type (Request, Maintenance, dll) - gaya outline
    if (!type) return 'border-slate-300 text-slate-600';
    const lowerType = type.toLowerCase();
    if (lowerType.includes('request')) return 'border-blue-300 text-blue-700 bg-blue-50';
    if (lowerType.includes('maintenance')) return 'border-amber-300 text-amber-700 bg-amber-50';
    if (lowerType.includes('it')) return 'border-blue-300 text-blue-700 bg-blue-50';
    if (lowerType.includes('ipsrs')) return 'border-amber-300 text-amber-700 bg-amber-50';
    return 'border-slate-300 text-slate-600 bg-slate-50';
}

function textPreview(value: string, maxLength: number) {
    const normalized = value.replace(/\s+/g, ' ').trim();
    if (normalized.length <= maxLength) return normalized;
    return normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd() + '…';
}

export default function TicketsIndex(props: Props) {
    const { filters, tickets, statusCounts, createdByUsers, raisedByUsers, canEdit, availableAssignees } = props;
    const { auth, flash } = usePage<PageProps<{ flash?: { success?: string; error?: string } }>>()
        .props;

    const isStaff = Boolean(auth.user.team) || auth.user.role === 'it' || auth.user.role === 'ipsrs';
    const isTicketClientView = filters.view_mode === 'client';
    const [closingId, setClosingId] = useState<number | null>(null);
    const [closingRating, setClosingRating] = useState<string>('');
    const [closingComment, setClosingComment] = useState<string>('');

    const { data, setData, processing } = useForm({
        view: filters.view ?? 'table',
        status: filters.status ?? '',
        period_start: filters.period_start ?? '',
        period_end: filters.period_end ?? '',
        q: filters.q ?? '',
        category: filters.category ?? '',
        project_id: filters.project_id ? String(filters.project_id) : '',
        created_by: filters.created_by ? String(filters.created_by) : '',
        raised_by: filters.raised_by ? String(filters.raised_by) : '',
        view_mode: filters.view_mode ?? 'personal',
    });
    const feedbackEditorConfig = {
        readonly: false,
        placeholder: 'Tulis komentar (opsional)…',
        height: 160,
        toolbarAdaptive: false,
        showCharsCounter: false,
        showWordsCounter: false,
        showXPathInStatusbar: false,
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        router.get(route('tickets.index'), data, { preserveState: true, replace: true });
    };

    const setStatus = (status: string) => {
        setData('status', status);
        router.get(route('tickets.index'), { ...data, status }, { preserveState: true, replace: true });
    };

    const setView = (view: 'table' | 'card') => {
        setData('view', view);
        router.get(route('tickets.index'), { ...data, view }, { preserveState: true, replace: true });
    };

    const clearPeriod = () => {
        setData('period_start', '');
        setData('period_end', '');
        router.get(
            route('tickets.index'),
            { ...data, period_start: '', period_end: '' },
            { preserveState: true, replace: true },
        );
    };

    const exportUrl = route('tickets.export', {
        status: data.status || undefined,
        period_start: data.period_start || undefined,
        period_end: data.period_end || undefined,
        q: data.q || undefined,
        category: data.category || undefined,
        project_id: data.project_id || undefined,
        created_by: data.created_by || undefined,
        raised_by: data.raised_by || undefined,
    });

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            {isTicketClientView ? 'Ticket Client' : 'My Tickets'}
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('tickets.create')}
                            className="inline-flex items-center rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
                        >
                            + New Ticket
                        </Link>
                        <a
                            href={exportUrl}
                            className="inline-flex items-center rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                        >
                            Export To Excel
                        </a>
                    </div>
                </div>
            }
        >
            <Head title={isTicketClientView ? 'Ticket Client' : 'My Tickets'} />

            <div className="py-8">
                <div className="w-full max-w-none sm:px-6 lg:px-8">
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

                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setView('card')}
                                className={
                                    'rounded-md px-3 py-2 text-sm font-semibold ' +
                                    (data.view === 'card'
                                        ? 'bg-slate-900 text-white'
                                        : 'bg-white text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-50')
                                }
                            >
                                Card View
                            </button>
                            <button
                                type="button"
                                onClick={() => setView('table')}
                                className={
                                    'rounded-md px-3 py-2 text-sm font-semibold ' +
                                    (data.view === 'table'
                                        ? 'bg-slate-900 text-white'
                                        : 'bg-white text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-50')
                                }
                            >
                                Table View
                            </button>
                        </div>
                    </div>

                    <form onSubmit={submit} className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="border-b border-gray-100 p-6">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                                <div className="md:col-span-3">
                                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Periode Start
                                    </div>
                                    <div className="mt-2">
                                        <DatePicker
                                            value={data.period_start}
                                            onChange={(next) => setData('period_start', next)}
                                            placeholder="Pilih Tanggal"
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-3">
                                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Periode End
                                    </div>
                                    <div className="mt-2">
                                        <DatePicker
                                            value={data.period_end}
                                            onChange={(next) => setData('period_end', next)}
                                            placeholder="Pilih Tanggal"
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2 md:col-start-9">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="mt-6 w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                                    >
                                        Search
                                    </button>
                                </div>
                                <div className="md:col-span-2">
                                    <button
                                        type="button"
                                        onClick={clearPeriod}
                                        className="mt-6 w-full rounded-md bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                                    >
                                        Clear Periode
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6">
                                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Status
                                </div>
                                <div className="mt-2 overflow-hidden rounded-md border border-slate-200 bg-white">
                                    <div className="grid grid-cols-2 md:grid-cols-6">
                                        {[
                                            { key: '', label: 'All', count: Object.values(statusCounts).reduce((a, b) => a + b, 0) },
                                            { key: 'open', label: 'Open', count: statusCounts.open },
                                            { key: 'in_progress', label: 'In Progress', count: statusCounts.in_progress },
                                            { key: 'pending', label: 'Pending', count: statusCounts.pending },
                                            { key: 'resolved', label: 'Review', count: statusCounts.resolved },
                                            { key: 'closed', label: 'Closed', count: statusCounts.closed },
                                        ].map((tab, idx) => (
                                            <button
                                                key={tab.key}
                                                type="button"
                                                onClick={() => setStatus(tab.key)}
                                                className={
                                                    'flex items-center justify-between gap-3 px-4 py-3 text-sm font-semibold ' +
                                                    (idx === 0 ? '' : 'border-l border-slate-200 ') +
                                                    (data.status === tab.key
                                                        ? 'bg-slate-900 text-white'
                                                        : 'bg-white text-slate-700 hover:bg-slate-50')
                                                }
                                            >
                                                <span className="min-w-0 truncate">{tab.label}</span>
                                                <span
                                                    className={
                                                        'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ' +
                                                        (data.status === tab.key
                                                            ? 'bg-white text-slate-900'
                                                            : 'bg-slate-900 text-white')
                                                    }
                                                >
                                                    {tab.count}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div
                                className={
                                    'mt-6 grid grid-cols-1 gap-2 ' +
                                    (isTicketClientView ? 'md:grid-cols-5' : 'md:grid-cols-3')
                                }
                            >
                                <div className="md:col-span-2">
                                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Search Keywords
                                    </div>
                                    <div className="mt-2 flex overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-400">
                                        <input
                                            type="text"
                                            value={data.q}
                                            onChange={(e) => setData('q', e.target.value)}
                                            placeholder="Cari tiket…"
                                            className="w-full border-0 text-sm focus:ring-0"
                                        />
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="inline-flex items-center justify-center bg-white px-3 text-slate-500 hover:bg-slate-50 disabled:opacity-60"
                                            aria-label="Search"
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
                                                    d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {isTicketClientView && (
                                    <div>
                                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Created By
                                        </div>
                                        <select
                                            value={data.created_by}
                                            onChange={(e) => {
                                                const next = e.target.value;
                                                setData('created_by', next);
                                                router.get(route('tickets.index'), { ...data, created_by: next }, { preserveState: true, replace: true });
                                            }}
                                            className="mt-2 w-full rounded-md border-slate-200 text-sm shadow-sm focus:border-slate-400 focus:ring-slate-400"
                                        >
                                            <option value="">All</option>
                                            {createdByUsers.map((u) => (
                                                <option key={u.id} value={String(u.id)}>
                                                    {u.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Unit Tujuan
                                    </div>
                                    <select
                                        value={data.category}
                                        onChange={(e) => {
                                            const next = e.target.value;
                                            setData('category', next);
                                            router.get(route('tickets.index'), { ...data, category: next }, { preserveState: true, replace: true });
                                        }}
                                        className="mt-2 w-full rounded-md border-slate-200 text-sm shadow-sm focus:border-slate-400 focus:ring-slate-400"
                                    >
                                        <option value="">All</option>
                                        <option value="IT">IT</option>
                                        <option value="IPSRS">IPSRS</option>
                                    </select>
                                </div>

                                {isTicketClientView && (
                                    <div>
                                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Raised By
                                        </div>
                                        <select
                                            value={data.raised_by}
                                            onChange={(e) => {
                                                const next = e.target.value;
                                                setData('raised_by', next);
                                                router.get(route('tickets.index'), { ...data, raised_by: next }, { preserveState: true, replace: true });
                                            }}
                                            className="mt-2 w-full rounded-md border-slate-200 text-sm shadow-sm focus:border-slate-400 focus:ring-slate-400"
                                        >
                                            <option value="">All</option>
                                            {raisedByUsers.map((u) => (
                                                <option key={u.id} value={String(u.id)}>
                                                    {u.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>
                    </form>

                    <div className="p-6">
                        {data.view === 'table' ? (
                            isTicketClientView ? (
                                <div className="w-full overflow-hidden rounded-lg border border-slate-200 bg-white">
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-full text-left text-xs">
                                            <thead className="bg-slate-50 text-slate-500">
                                                <tr className="border-b border-slate-200">
                                                    <th className="whitespace-nowrap px-3 py-3 font-semibold">Tickets</th>
                                                    <th className="whitespace-nowrap px-3 py-3 font-semibold">Status</th>
                                                    {canEdit && (
                                                        <th className="whitespace-nowrap px-3 py-3 font-semibold">Assignee</th>
                                                    )}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {tickets.data.map((t) => {
                                                    const replied = Number(t.comments_count ?? 0) > 0;
                                                    const requesterName = t.requester?.name ?? '—';
                                                    const initials =
                                                        (t.requester?.name || t.title || 'T')
                                                            .trim()
                                                            .slice(0, 1)
                                                            .toUpperCase();
                                                    const categoryLabel = t.type ?? t.category ?? '—';

                                                    return (
                                                        <tr key={t.id} className="hover:bg-slate-50">
                                                            <td className="px-3 py-4 align-top">
                                                                <div className="flex gap-3">
                                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-800">
                                                                        {initials}
                                                                    </div>
                                                                    <div className="min-w-0 flex-1">
                                                                        <div className="flex items-start justify-between gap-3">
                                                                            <Link
                                                                                href={route('tickets.show', t.id)}
                                                                                className="min-w-0 font-semibold text-slate-900 hover:underline"
                                                                            >
                                                                                <span className="text-slate-700">
                                                                                    #{ticketCodeShort(t.code)}
                                                                                </span>
                                                                                <span className="text-slate-900">
                                                                                    {' '}
                                                                                    - {t.title}
                                                                                </span>
                                                                            </Link>
                                                                        </div>

                                                                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                                                                            <span>
                                                                                Start Date:{' '}
                                                                                <span className="font-semibold text-slate-600">
                                                                                    {formatDateShort(t.created_at)}
                                                                                </span>
                                                                            </span>
                                                                            <span>
                                                                                Due Date:{' '}
                                                                                <span className="font-semibold text-slate-600">
                                                                                    -
                                                                                </span>
                                                                            </span>
                                                                        </div>

                                                                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                                                                            {t.category && (
                                                                                <span className="inline-flex items-center gap-1">
                                                                                    <svg
                                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                                        viewBox="0 0 24 24"
                                                                                        fill="none"
                                                                                        stroke="currentColor"
                                                                                        strokeWidth="1.5"
                                                                                        className="h-3.5 w-3.5"
                                                                                    >
                                                                                        <path
                                                                                            strokeLinecap="round"
                                                                                            strokeLinejoin="round"
                                                                                            d="M7.5 4.5h9A2.25 2.25 0 0118.75 6.75v12A2.25 2.25 0 0116.5 21h-9A2.25 2.25 0 015.25 18.75v-12A2.25 2.25 0 017.5 4.5z"
                                                                                        />
                                                                                        <path
                                                                                            strokeLinecap="round"
                                                                                            strokeLinejoin="round"
                                                                                            d="M8.25 9h7.5M8.25 12h7.5M8.25 15h4.5"
                                                                                        />
                                                                                    </svg>
                                                                                    <span className={`rounded px-2 py-0.5 text-xs font-semibold text-white ${
                                                                                        t.category === 'IT'
                                                                                            ? 'bg-blue-500'
                                                                                            : 'bg-amber-500'
                                                                                    }`}>
                                                                                        {t.category}
                                                                                    </span>
                                                                                </span>
                                                                            )}
                                                                            {t.type && (
                                                                                <span className="inline-flex items-center gap-1">
                                                                                    <svg
                                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                                        viewBox="0 0 24 24"
                                                                                        fill="none"
                                                                                        stroke="currentColor"
                                                                                        strokeWidth="1.5"
                                                                                        className="h-3.5 w-3.5"
                                                                                    >
                                                                                        <path
                                                                                            strokeLinecap="round"
                                                                                            strokeLinejoin="round"
                                                                                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                                                                        />
                                                                                    </svg>
                                                                                    <span className={`border rounded px-2 py-0.5 text-xs font-semibold ${typePillClass(t.type)}`}>
                                                                                        {t.type}
                                                                                    </span>
                                                                                </span>
                                                                            )}
                                                                            <span className="inline-flex items-center gap-1">
                                                                                <svg
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                    viewBox="0 0 24 24"
                                                                                    fill="none"
                                                                                    stroke="currentColor"
                                                                                    strokeWidth="1.5"
                                                                                    className="h-3.5 w-3.5"
                                                                                >
                                                                                    <path
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                        d="M20.25 21v-1.5a4.5 4.5 0 00-4.5-4.5h-7.5a4.5 4.5 0 00-4.5 4.5V21"
                                                                                    />
                                                                                    <path
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                        d="M12 12a4.5 4.5 0 100-9 4.5 4.5 0 000 9z"
                                                                                    />
                                                                                </svg>
                                                                                <span className="font-semibold text-rose-600">
                                                                                    {requesterName}
                                                                                </span>
                                                                            </span>
                                                                            <span className="inline-flex items-center gap-1">
                                                                                <svg
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                    viewBox="0 0 24 24"
                                                                                    fill="none"
                                                                                    stroke="currentColor"
                                                                                    strokeWidth="1.5"
                                                                                    className="h-3.5 w-3.5"
                                                                                >
                                                                                    <path
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                                                    />
                                                                                </svg>
                                                                                <span className="font-semibold text-slate-600">
                                                                                    {formatDateShort(t.created_at)}
                                                                                </span>
                                                                            </span>
                                                                            <span className="inline-flex items-center gap-1">
                                                                                <svg
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                    viewBox="0 0 24 24"
                                                                                    fill="none"
                                                                                    stroke="currentColor"
                                                                                    strokeWidth="1.5"
                                                                                    className="h-3.5 w-3.5"
                                                                                >
                                                                                    <path
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                        d="M12 6v6l4 2"
                                                                                    />
                                                                                    <path
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                                                    />
                                                                                </svg>
                                                                                <span className="font-semibold text-slate-600">
                                                                                    {formatDateTime(t.created_at)}
                                                                                </span>
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="whitespace-nowrap px-3 py-4 align-top">
                                                                <div className="flex flex-col gap-2">
                                                                    {canEdit ? (
                                                                        <select
                                                                            value={t.status}
                                                                            onChange={(e) => {
                                                                                router.patch(
                                                                                    route('tickets.status', t.id),
                                                                                    { status: e.target.value as TicketStatus },
                                                                                    { preserveScroll: true },
                                                                                );
                                                                            }}
                                                                            className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                                                                        >
                                                                            <option value="open">Open</option>
                                                                            <option value="in_progress">In Progress</option>
                                                                            <option value="pending">Pending</option>
                                                                            <option value="resolved">Review</option>
                                                                            <option value="closed">Closed</option>
                                                                        </select>
                                                                    ) : (
                                                                        <div
                                                                            className={
                                                                                'inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-semibold w-fit ' +
                                                                                statusPillClass(t.status)
                                                                            }
                                                                        >
                                                                            {statusLabel(t.status)}
                                                                        </div>
                                                                    )}
                                                                    <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700">
                                                                        <span
                                                                            className={
                                                                                'inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white ' +
                                                                                priorityIconClass(t.priority)
                                                                            }
                                                                        >
                                                                            !
                                                                        </span>
                                                                        {priorityLabel(t.priority)}
                                                                    </div>
                                                                    {isStaff && !t.assignee && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                router.post(
                                                                                    route('tickets.claim', t.id),
                                                                                    {},
                                                                                    { preserveScroll: true },
                                                                                )
                                                                            }
                                                                            className="inline-flex items-center justify-center rounded bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-500"
                                                                        >
                                                                            Claim
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            {canEdit && (
                                                                <td className="whitespace-nowrap px-3 py-4 align-top">
                                                                    <div className="flex w-56 flex-col gap-2">
                                                                        <select
                                                                            value={t.assignee?.id ?? ''}
                                                                            onChange={(e) => {
                                                                                const assigneeId = e.target.value ? Number(e.target.value) : null;
                                                                                if (assigneeId) {
                                                                                    router.post(
                                                                                        route('tickets.assign', t.id),
                                                                                        { assignee_id: assigneeId },
                                                                                        { preserveScroll: true },
                                                                                    );
                                                                                }
                                                                            }}
                                                                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                                                                        >
                                                                            <option value="">Pilih Assignee</option>
                                                                            {availableAssignees.map((user) => (
                                                                                <option key={user.id} value={user.id}>
                                                                                    {user.name}
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                        {t.assignee && (
                                                                            <div className="text-xs text-slate-500">
                                                                                {t.assignee.name}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            )}
                                                        </tr>
                                                    );
                                                })}
                                                {tickets.data.length === 0 && (
                                                    <tr>
                                                        <td
                                                            colSpan={canEdit ? 3 : 2}
                                                            className="px-4 py-10 text-center text-sm text-slate-500"
                                                        >
                                                            No data.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {[
                                        { key: 'review', label: 'To Be Review', pill: 'bg-emerald-600', statuses: ['resolved'] },
                                        { key: 'processed', label: 'Processed', pill: 'bg-amber-500', statuses: ['in_progress', 'pending', 'closed'] },
                                        { key: 'new', label: 'New Ticket', pill: 'bg-purple-600', statuses: ['open'] },
                                    ].map((group) => {
                                        const items = tickets.data.filter((t) =>
                                            (group.statuses as readonly TicketStatus[]).includes(t.status),
                                        );

                                        return (
                                            <div
                                                key={group.key}
                                                className="overflow-hidden rounded-lg border border-slate-200 bg-white"
                                            >
                                                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                                                    <div className="inline-flex items-center gap-2">
                                                        <span className={`rounded px-3 py-1 text-xs font-semibold text-white ${group.pill}`}>
                                                            {group.label}
                                                        </span>
                                                        <span className="text-xs font-semibold text-slate-500">{items.length}</span>
                                                    </div>
                                                </div>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full min-w-full text-left text-xs">
                                                        <thead className="bg-slate-50 text-slate-500">
                                                            <tr className="border-b border-slate-200">
                                                                <th className="whitespace-nowrap px-4 py-3 font-semibold">ID</th>
                                                                <th className="whitespace-nowrap px-3 py-3 font-semibold">Priority</th>
                                                                <th className="px-3 py-3 font-semibold">Title</th>
                                                                <th className="whitespace-nowrap px-3 py-3 font-semibold">Unit Tujuan</th>
                                                                <th className="whitespace-nowrap px-3 py-3 font-semibold">Created</th>
                                                                <th className="whitespace-nowrap px-3 py-3 font-semibold">Date Start</th>
                                                                <th className="whitespace-nowrap px-3 py-3 font-semibold">Status</th>

                                                                <th className="whitespace-nowrap px-3 py-3 font-semibold">Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100">
                                                            {items.map((t) => {
                                                                const replied = Number(t.comments_count ?? 0) > 0;
                                                                const categoryLabel = t.type ?? t.category ?? '-';
                                                                return (
                                                                    <tr key={t.id} className="hover:bg-slate-50">
                                                                        <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-700">
                                                                            {ticketCodeShort(t.code)}
                                                                        </td>
                                                                        <td className="whitespace-nowrap px-3 py-3">
                                                                            <span className="inline-flex items-center gap-2">
                                                                                <span
                                                                                    className={
                                                                                        'inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white ' +
                                                                                        priorityIconClass(t.priority)
                                                                                    }
                                                                                >
                                                                                    !
                                                                                </span>
                                                                                <span className="font-semibold text-slate-700">
                                                                                    {t.priority === 'high'
                                                                                        ? 'High'
                                                                                        : t.priority === 'low'
                                                                                            ? 'Low'
                                                                                            : 'Medium'}
                                                                                </span>
                                                                            </span>
                                                                        </td>
                                                                        <td className="min-w-[280px] px-3 py-3">
                                                                            <Link
                                                                                href={route('tickets.show', t.id)}
                                                                                className="font-semibold text-blue-800 hover:underline"
                                                                            >
                                                                                {t.title}
                                                                            </Link>
                                                                        </td>
                                                                        <td className="whitespace-nowrap px-3 py-3">
                                                                            <div className="flex flex-wrap gap-2">
                                                                                {t.category && (
                                                                                    <span className={`rounded px-2 py-0.5 text-xs font-semibold text-white ${
                                                                                        t.category === 'IT'
                                                                                            ? 'bg-blue-500'
                                                                                            : 'bg-amber-500'
                                                                                    }`}>
                                                                                        {t.category}
                                                                                    </span>
                                                                                )}
                                                                                {t.type && (
                                                                                    <span className={`border rounded px-2 py-0.5 text-xs font-semibold ${typePillClass(t.type)}`}>
                                                                                        {t.type}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                        <td className="whitespace-nowrap px-3 py-3 text-slate-600">
                                                                            {formatDateShort(t.created_at)}
                                                                        </td>
                                                                        <td className="whitespace-nowrap px-3 py-3 text-slate-600">
                                                                            {formatDateShort(t.created_at)}
                                                                        </td>
                                                                        <td className="whitespace-nowrap px-3 py-3">
                                                                            {auth.user.role === 'admin_unit' ||
                                                                            (isStaff && (t.assignee?.id === auth.user.id || !t.assignee?.id)) ? (
                                                                                <select
                                                                                    value={t.status}
                                                                                    onChange={(e) =>
                                                                                        router.patch(
                                                                                            route('tickets.status', t.id),
                                                                                            { status: e.target.value },
                                                                                            { preserveScroll: true },
                                                                                        )
                                                                                    }
                                                                                    className="rounded-md border-slate-200 text-xs shadow-sm focus:border-slate-400 focus:ring-slate-400"
                                                                                >
                                                                                    <option value="open">Open</option>
                                                                                    <option value="in_progress">In Progress</option>
                                                                                    <option value="pending">Pending</option>
                                                                                    <option value="resolved">Review</option>
                                                                                    <option value="closed">Closed</option>
                                                                                </select>
                                                                            ) : (
                                                                                <span
                                                                                    className={
                                                                                        'inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-semibold w-fit ' +
                                                                                        statusPillClass(t.status)
                                                                                    }
                                                                                >
                                                                                    {statusLabel(t.status)}
                                                                                </span>
                                                                            )}
                                                                        </td>

                                                                        <td className="whitespace-nowrap px-3 py-3">
                                                                            <div className="flex items-center gap-2">
                                                                                <Link
                                                                                    href={route('tickets.show', t.id)}
                                                                                    className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                                                                                    aria-label="View"
                                                                                >
                                                                                    <svg
                                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                                        viewBox="0 0 24 24"
                                                                                        fill="none"
                                                                                        stroke="currentColor"
                                                                                        strokeWidth="1.5"
                                                                                        className="h-4 w-4"
                                                                                    >
                                                                                        <path
                                                                                            strokeLinecap="round"
                                                                                            strokeLinejoin="round"
                                                                                            d="M2.25 12c2.25-4.5 6-7.5 9.75-7.5s7.5 3 9.75 7.5c-2.25 4.5-6 7.5-9.75 7.5S4.5 16.5 2.25 12z"
                                                                                        />
                                                                                        <path
                                                                                            strokeLinecap="round"
                                                                                            strokeLinejoin="round"
                                                                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                                        />
                                                                                    </svg>
                                                                                </Link>
                                                                                {isStaff && !t.assignee && (
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() =>
                                                                                            router.post(
                                                                                                route('tickets.claim', t.id),
                                                                                                {},
                                                                                                { preserveScroll: true },
                                                                                            )
                                                                                        }
                                                                                        className="rounded bg-rose-600 px-2 py-1 text-xs font-semibold text-white hover:bg-rose-500"
                                                                                    >
                                                                                        Claim
                                                                                    </button>
                                                                                )}
                                                                                {!isStaff &&
                                                                                    t.status === 'resolved' &&
                                                                                    t.requester?.id === auth.user.id && (
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => {
                                                                                                setClosingId(t.id);
                                                                                                setClosingRating('');
                                                                                                setClosingComment('');
                                                                                            }}
                                                                                            className="rounded bg-slate-900 px-2 py-1 text-xs font-semibold text-white hover:bg-slate-800"
                                                                                        >
                                                                                            Close
                                                                                        </button>
                                                                                    )}
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                            {items.length === 0 && (
                                                                <tr>
                                                                    <td
                                                                        colSpan={9}
                                                                        className="px-4 py-10 text-center text-sm text-slate-500"
                                                                    >
                                                                        No data.
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )
                        ) : (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3">
                                {tickets.data.map((t) => (
                                    <div
                                        key={t.id}
                                        className="relative overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
                                    >
                                        <div className="flex items-start justify-between px-4 pt-4">
                                            <div>
                                                <div
                                                    className={
                                                        'rounded-md px-3 py-1.5 text-xs font-semibold ' +
                                                        statusPillClass(t.status)
                                                    }
                                                >
                                                    {statusLabel(t.status)}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {!isStaff && t.status === 'resolved' && t.requester?.id === auth.user.id && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setClosingId(t.id);
                                                            setClosingRating('');
                                                            setClosingComment('');
                                                        }}
                                                        className="rounded bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                                                    >
                                                        Close
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                                    aria-label="Menu"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 24 24"
                                                        fill="currentColor"
                                                        className="h-5 w-5"
                                                    >
                                                        <path d="M12 6a2 2 0 110-4 2 2 0 010 4zm0 10a2 2 0 110-4 2 2 0 010 4zm0 10a2 2 0 110-4 2 2 0 010 4z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="px-4 pb-4 pt-3">
                                            <div className="flex items-start justify-between gap-3">
                                                <Link
                                                    href={route('tickets.show', t.id)}
                                                    className="block min-w-0 flex-1 pr-2"
                                                >
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <div className="text-base font-semibold leading-snug text-blue-800 hover:underline">
                                                            {t.title}
                                                        </div>
                                                        {t.category && (
                                                            <span className={`rounded px-3 py-1.5 text-xs font-semibold text-white ${
                                                                t.category === 'IT'
                                                                    ? 'bg-blue-500'
                                                                    : 'bg-amber-500'
                                                            }`}>
                                                                {t.category}
                                                            </span>
                                                        )}
                                                        {t.type && (
                                                            <span className={`border rounded px-3 py-1.5 text-xs font-semibold ${typePillClass(t.type)}`}>
                                                                {t.type}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="mt-1 text-sm font-semibold text-rose-600">
                                                        {ticketSubtitle(t.status)}
                                                    </div>
                                                </Link>
                                                {t.status !== 'open' && t.feedback_rating != null && (
                                                    <div className="flex shrink-0 items-center gap-1 pt-1">
                                                        {Array.from({ length: 5 }).map((_, i) => {
                                                            const filled = i + 1 <= (t.feedback_rating ?? 0);
                                                            return (
                                                                <svg
                                                                    key={i}
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    viewBox="0 0 20 20"
                                                                    fill="currentColor"
                                                                    className={'h-4 w-4 ' + (filled ? 'text-amber-500' : 'text-slate-200')}
                                                                >
                                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.539 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.783.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.93 8.81c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                                                                </svg>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-4 border-t border-slate-200 pt-3 text-sm text-slate-500">
                                                <div className="flex items-center justify-between">
                                                    <div className="font-semibold text-slate-400">ID# : {ticketCodeShort(t.code)}</div>
                                                    <div className="font-semibold">{timeAgo(t.created_at)}</div>
                                                </div>
                                                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                                                    <span className="font-semibold text-slate-400">Start Date:</span>
                                                    <span>{formatDateShort(t.created_at)}</span>
                                                    <span className="font-semibold text-slate-400">Due Date:</span>
                                                    <span>-</span>
                                                </div>
                                            </div>

                                            <div className="mt-3 text-sm text-slate-600">
                                                {t.description
                                                    ? textPreview(t.description, 220)
                                                    : t.type ?? '-'}
                                            </div>
                                        </div>

                                        <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                                            <div className="flex items-end justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="text-xs text-slate-500">
                                                        Last Replied :{' '}
                                                        <span className="font-semibold text-orange-600">
                                                            {t.last_replied_by ?? '-'}
                                                        </span>
                                                    </div>
                                                    <div className="mt-1 text-xs text-slate-500">Assign By :</div>
                                                    <div className="truncate text-sm font-semibold text-amber-900">
                                                        {t.assignee?.name ?? '-'}
                                                    </div>
                                                    <div className="mt-1 text-xs text-slate-500">Raised by :</div>
                                                    <div className="truncate text-sm font-semibold text-slate-800">
                                                        {t.requester?.name ?? '-'}
                                                    </div>
                                                    <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                                                        <span className="inline-flex items-center gap-1">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="1.5"
                                                                className="h-4 w-4"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M8 7V3m8 4V3M3 11h18M5 7h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2z"
                                                                />
                                                            </svg>
                                                            {formatDateShort(t.created_at)}
                                                        </span>
                                                        <span className="inline-flex items-center gap-1">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="1.5"
                                                                className="h-4 w-4"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z"
                                                                />
                                                            </svg>
                                                            00:00
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex shrink-0 items-center gap-4 text-slate-500">
                                                    <Link
                                                        className="inline-flex items-center gap-1 text-xs hover:text-slate-700"
                                                        href={`${route('tickets.show', t.id)}?reply=1`}
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
                                                                d="M8 10h8m-8 4h5m-8 7l4-4h11a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14z"
                                                            />
                                                        </svg>
                                                        {t.comments_count ?? 0}
                                                    </Link>
                                                    {Boolean(t.attachments_count) && Number(t.attachments_count) > 0 && (
                                                        <a
                                                            className="inline-flex items-center gap-1 text-xs hover:text-slate-700"
                                                            href={route('tickets.attachments.download', { ticket: t.id, index: 0 })}
                                                            target="_blank"
                                                            rel="noreferrer"
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
                                                                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828L18 9.828a4 4 0 10-5.656-5.656L6.343 10.172a6 6 0 108.485 8.485L20 13.485"
                                                                />
                                                            </svg>
                                                            {t.attachments_count}
                                                        </a>
                                                    )}
                                                    <span
                                                        className={
                                                            'inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white ' +
                                                            priorityIconClass(t.priority)
                                                        }
                                                        aria-label={priorityLabel(t.priority)}
                                                        title={priorityLabel(t.priority)}
                                                    >
                                                        !
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {tickets.data.length === 0 && (
                                    <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                                        Belum ada ticket.
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                            {tickets.links.map((l) =>
                                l.url ? (
                                    <Link
                                        key={l.label}
                                        href={l.url}
                                        preserveState
                                        replace
                                        className={
                                            'rounded-md px-3 py-2 text-sm font-semibold ' +
                                            (l.active
                                                ? 'bg-slate-900 text-white'
                                                : 'bg-white text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-50')
                                        }
                                    >
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: l.label,
                                            }}
                                        />
                                    </Link>
                                ) : (
                                    <span
                                        key={l.label}
                                        className="cursor-not-allowed rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-400"
                                        dangerouslySetInnerHTML={{
                                            __html: l.label,
                                        }}
                                    />
                                ),
                            )}
                        </div>
                    </div>

                    <Modal show={closingId !== null} onClose={() => setClosingId(null)}>
                        <div className="border-b border-slate-100 px-6 py-4">
                            <h3 className="text-lg font-semibold text-slate-900">Close Ticket</h3>
                        </div>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (closingId === null) return;
                                router.post(
                                    route('tickets.close', closingId),
                                    { rating: closingRating, comment: closingComment },
                                    {
                                        onSuccess: () => setClosingId(null),
                                        preserveScroll: true,
                                    },
                                );
                            }}
                            className="px-6 py-4"
                        >
                            <div className="mb-4">
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Rating
                                </label>
                                <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setClosingRating(String(star))}
                                            className="focus:outline-none"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                                className={
                                                    'h-8 w-8 ' +
                                                    (Number(closingRating) >= star
                                                        ? 'text-amber-500'
                                                        : 'text-slate-300 hover:text-amber-400')
                                                }
                                            >
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.539 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.783.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.93 8.81c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                                            </svg>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Komentar
                                </label>
                                <JoditEditor
                                    config={feedbackEditorConfig}
                                    value={closingComment}
                                    onChange={(newVal) => setClosingComment(newVal)}
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setClosingId(null)}
                                    className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                                >
                                    Close Ticket
                                </button>
                            </div>
                        </form>
                    </Modal>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
