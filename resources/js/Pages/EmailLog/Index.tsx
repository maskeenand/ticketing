import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

type EmailLogItem = {
    id: number;
    recipient_email: string;
    recipient_name: string | null;
    subject: string;
    notification_type: string;
    ticket_id: number | null;
    ticket_code: string | null;
    status: 'pending' | 'sent' | 'failed';
    error_message: string | null;
    attempt_count: number;
    sent_at: string | null;
    created_at: string;
};

type PaginationLink = { url: string | null; label: string; active: boolean };

type Props = PageProps<{
    logs: {
        data: EmailLogItem[];
        links: PaginationLink[];
        total: number;
        from: number | null;
        to: number | null;
    };
    counts: { all: number; pending: number; sent: number; failed: number };
    filters: { status: string | null; q: string | null; type: string | null };
}>;

const statusBadge = (status: string) => {
    if (status === 'sent')
        return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">✓ Terkirim</span>;
    if (status === 'failed')
        return <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-700">✗ Gagal</span>;
    return <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">⏳ Pending</span>;
};

const typeBadge = (type: string) => {
    if (type === 'TicketCreated')
        return <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">Buat Tiket</span>;
    if (type === 'TicketCommented')
        return <span className="rounded bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700">Komentar</span>;
    return <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{type}</span>;
};

const formatDate = (iso: string | null) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' });
};

export default function EmailLogIndex({ logs, counts, filters }: Props) {
    const { flash } = usePage<PageProps<{ flash?: { success?: string; error?: string } }>>().props;
    const [search, setSearch] = useState(filters.q ?? '');
    const [expandedError, setExpandedError] = useState<number | null>(null);
    const { post, processing } = useForm();

    const applyFilter = (overrides: Record<string, string>) => {
        router.get(route('email-logs.index'), { ...filters, ...overrides, q: search }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilter({ q: search });
    };

    const handleRetry = (id: number) => {
        router.post(route('email-logs.retry', id), {}, { preserveScroll: true });
    };

    const handleRetryAll = () => {
        if (!confirm('Kirim ulang semua email yang gagal?')) return;
        router.post(route('email-logs.retry-all'), {}, { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">Email Log</h2>
                        <p className="mt-0.5 text-sm text-slate-500">Monitor dan retry pengiriman email notifikasi</p>
                    </div>
                    {counts.failed > 0 && (
                        <button
                            type="button"
                            onClick={handleRetryAll}
                            className="inline-flex items-center gap-2 rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Retry Semua Gagal ({counts.failed})
                        </button>
                    )}
                </div>
            }
        >
            <Head title="Email Log" />

            <div className="py-8">
                <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 space-y-4">

                    {/* Flash messages */}
                    {flash?.success && (
                        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                            {flash.error}
                        </div>
                    )}

                    {/* Status summary cards */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {[
                            { label: 'Total', value: counts.all, color: 'bg-slate-50 border-slate-200 text-slate-700', active: !filters.status, key: '' },
                            { label: 'Terkirim', value: counts.sent, color: 'bg-emerald-50 border-emerald-200 text-emerald-700', active: filters.status === 'sent', key: 'sent' },
                            { label: 'Pending', value: counts.pending, color: 'bg-amber-50 border-amber-200 text-amber-700', active: filters.status === 'pending', key: 'pending' },
                            { label: 'Gagal', value: counts.failed, color: 'bg-rose-50 border-rose-200 text-rose-700', active: filters.status === 'failed', key: 'failed' },
                        ].map((s) => (
                            <button
                                key={s.key}
                                type="button"
                                onClick={() => applyFilter({ status: s.key })}
                                className={`rounded-lg border p-4 text-left transition-all ${s.color} ${s.active ? 'ring-2 ring-offset-1 ring-slate-400' : 'hover:opacity-80'}`}
                            >
                                <div className="text-2xl font-bold">{s.value}</div>
                                <div className="text-xs font-semibold uppercase tracking-wide opacity-70">{s.label}</div>
                            </button>
                        ))}
                    </div>

                    {/* Search & filter bar */}
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3">
                            <div className="relative flex-1 min-w-[200px]">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                                </svg>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari email, nama, subjek, kode tiket..."
                                    className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                                />
                            </div>
                            <select
                                value={filters.type ?? ''}
                                onChange={(e) => applyFilter({ type: e.target.value })}
                                className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                            >
                                <option value="">Semua Tipe</option>
                                <option value="TicketCreated">Buat Tiket</option>
                                <option value="TicketCommented">Komentar</option>
                            </select>
                            <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
                                Cari
                            </button>
                            {(filters.q || filters.status || filters.type) && (
                                <button
                                    type="button"
                                    onClick={() => { setSearch(''); applyFilter({ status: '', q: '', type: '' }); }}
                                    className="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                                >
                                    Reset
                                </button>
                            )}
                        </form>
                    </div>

                    {/* Table */}
                    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        {['Penerima', 'Subjek', 'Tiket', 'Tipe', 'Status', 'Percobaan', 'Waktu', 'Aksi'].map((h) => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {logs.data.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-400">
                                                Tidak ada data email log.
                                            </td>
                                        </tr>
                                    )}
                                    {logs.data.map((log) => (
                                        <>
                                            <tr key={log.id} className="hover:bg-slate-50">
                                                <td className="px-4 py-3">
                                                    <div className="text-sm font-semibold text-slate-800">{log.recipient_name ?? '-'}</div>
                                                    <div className="text-xs text-slate-500">{log.recipient_email}</div>
                                                </td>
                                                <td className="px-4 py-3 max-w-xs">
                                                    <div className="truncate text-sm text-slate-700" title={log.subject}>{log.subject}</div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                                                    {log.ticket_code
                                                        ? <Link href={route('tickets.show', log.ticket_id!)} className="font-semibold text-blue-600 hover:underline">{log.ticket_code}</Link>
                                                        : '-'}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">{typeBadge(log.notification_type)}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{statusBadge(log.status)}</td>
                                                <td className="px-4 py-3 text-center text-sm text-slate-600">{log.attempt_count}x</td>
                                                <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                                                    <div>{formatDate(log.created_at)}</div>
                                                    {log.sent_at && <div className="text-emerald-600">Dikirim: {formatDate(log.sent_at)}</div>}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        {(log.status === 'failed' || log.status === 'pending') && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRetry(log.id)}
                                                                className="inline-flex items-center gap-1 rounded-md bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-600"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                                </svg>
                                                                Retry
                                                            </button>
                                                        )}
                                                        {log.error_message && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setExpandedError(expandedError === log.id ? null : log.id)}
                                                                className="text-xs text-rose-600 hover:underline"
                                                            >
                                                                {expandedError === log.id ? 'Sembunyikan' : 'Lihat error'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                            {expandedError === log.id && log.error_message && (
                                                <tr key={`err-${log.id}`} className="bg-rose-50">
                                                    <td colSpan={8} className="px-4 py-3">
                                                        <div className="text-xs font-semibold text-rose-700 mb-1">Pesan Error:</div>
                                                        <pre className="whitespace-pre-wrap break-all text-xs text-rose-800 bg-rose-100 rounded p-2">
                                                            {log.error_message}
                                                        </pre>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {logs.data.length > 0 && (
                            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
                                <div className="text-sm text-slate-500">
                                    Menampilkan {logs.from ?? 0}–{logs.to ?? 0} dari {logs.total} email
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {logs.links.map((l, i) => (
                                        <Link
                                            key={i}
                                            href={l.url ?? '#'}
                                            className={`rounded-md px-3 py-1.5 text-sm ${l.active ? 'bg-slate-900 text-white' : l.url ? 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50' : 'bg-white text-slate-300 ring-1 ring-slate-100'}`}
                                            disabled={!l.url}
                                        >
                                            <span dangerouslySetInnerHTML={{ __html: l.label }} />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
