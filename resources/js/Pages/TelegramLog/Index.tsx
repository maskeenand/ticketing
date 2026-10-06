import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

type TelegramLogItem = {
    id: number;
    event_type: string;
    status: 'sent' | 'failed' | string;
    message: string | null;
    provider_message_id: string | null;
    created_at: string;
    user: { name: string; email: string } | null;
};

type PaginationLink = { url: string | null; label: string; active: boolean };

type Props = PageProps<{
    logs: {
        data: TelegramLogItem[];
        links: PaginationLink[];
        total: number;
        from: number | null;
        to: number | null;
    };
    counts: { all: number; sent: number; failed: number };
    filters: { status: string | null; q: string | null; event_type: string | null };
}>;

const eventLabels: Record<string, string> = {
    telegram_test: 'Tes Telegram',
    ticket_created: 'Tiket dibuat',
    ticket_assigned: 'Tiket ditugaskan',
    ticket_status_updated: 'Status tiket berubah',
    ticket_commented: 'Komentar tiket',
    ticket_resolved: 'Tiket selesai',
};

const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

function StatusBadge({ status }: { status: string }) {
    if (status === 'sent') {
        return <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">Terkirim</span>;
    }

    if (status === 'failed') {
        return <span className="inline-flex rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">Gagal</span>;
    }

    return <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">{status}</span>;
}

export default function TelegramLogIndex({ logs, counts, filters }: Props) {
    const [search, setSearch] = useState(filters.q ?? '');

    const applyFilters = (overrides: Record<string, string>) => {
        router.get(route('telegram-logs.index'), {
            status: filters.status ?? '',
            event_type: filters.event_type ?? '',
            q: search,
            ...overrides,
        }, { preserveState: true, replace: true });
    };

    const submitSearch = (event: FormEvent) => {
        event.preventDefault();
        applyFilters({ q: search });
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">Telegram Log</h2>
                    <p className="mt-0.5 text-sm text-slate-500">Riwayat pengiriman notifikasi Telegram</p>
                </div>
            }
        >
            <Head title="Telegram Log" />

            <div className="py-8">
                <div className="w-full space-y-4 px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {[
                            { label: 'Total', value: counts.all, key: '', color: 'border-slate-200 bg-white text-slate-800' },
                            { label: 'Terkirim', value: counts.sent, key: 'sent', color: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
                            { label: 'Gagal', value: counts.failed, key: 'failed', color: 'border-rose-200 bg-rose-50 text-rose-800' },
                        ].map((item) => (
                            <button
                                key={item.key}
                                type="button"
                                onClick={() => applyFilters({ status: item.key })}
                                className={`rounded-lg border p-4 text-left transition hover:brightness-[0.98] ${item.color} ${filters.status === (item.key || null) ? 'ring-2 ring-teal-500 ring-offset-1' : ''}`}
                            >
                                <div className="text-2xl font-bold">{item.value}</div>
                                <div className="mt-1 text-xs font-semibold uppercase text-current/70">{item.label}</div>
                            </button>
                        ))}
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <form onSubmit={submitSearch} className="flex flex-wrap items-center gap-3">
                            <input
                                type="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Cari penerima atau pesan..."
                                className="min-w-[220px] flex-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                            />
                            <select
                                value={filters.event_type ?? ''}
                                onChange={(event) => applyFilters({ event_type: event.target.value })}
                                className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                            >
                                <option value="">Semua event</option>
                                {Object.entries(eventLabels).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                            <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
                                Cari
                            </button>
                            {(filters.q || filters.status || filters.event_type) && (
                                <button
                                    type="button"
                                    onClick={() => { setSearch(''); applyFilters({ q: '', status: '', event_type: '' }); }}
                                    className="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                                >
                                    Reset
                                </button>
                            )}
                        </form>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        {['Waktu', 'Penerima', 'Event', 'Status', 'Pesan Telegram', 'Message ID'].map((heading) => (
                                            <th key={heading} className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {logs.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">
                                                Belum ada data Telegram Log.
                                            </td>
                                        </tr>
                                    ) : logs.data.map((log) => (
                                        <tr key={log.id} className="align-top hover:bg-slate-50">
                                            <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">{formatDate(log.created_at)}</td>
                                            <td className="px-4 py-3">
                                                <div className="text-sm font-medium text-slate-800">{log.user?.name ?? 'Pengguna dihapus'}</div>
                                                {log.user?.email && <div className="text-xs text-slate-500">{log.user.email}</div>}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">{eventLabels[log.event_type] ?? log.event_type}</td>
                                            <td className="whitespace-nowrap px-4 py-3"><StatusBadge status={log.status} /></td>
                                            <td className="max-w-md px-4 py-3 text-xs text-slate-600">
                                                <div className="max-h-24 overflow-auto whitespace-pre-wrap break-words">{log.message ?? '-'}</div>
                                            </td>
                                            <td className="px-4 py-3 font-mono text-xs text-slate-500">{log.provider_message_id ?? '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {logs.data.length > 0 && (
                            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
                                <div className="text-sm text-slate-500">
                                    Menampilkan {logs.from ?? 0}–{logs.to ?? 0} dari {logs.total} log
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {logs.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url ?? '#'}
                                            className={`rounded-md px-3 py-1.5 text-sm ${link.active ? 'bg-slate-900 text-white' : link.url ? 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50' : 'bg-white text-slate-300 ring-1 ring-slate-100'}`}
                                            disabled={!link.url}
                                        >
                                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
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