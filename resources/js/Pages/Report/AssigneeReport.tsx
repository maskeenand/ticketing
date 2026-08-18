import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

interface AssigneeStatistic {
    id: number;
    name: string;
    employee_id: string | null;
    team: string | null;
    role: string | null;
    total_assigned: number;
    open: number;
    in_progress: number;
    resolved: number;
    closed: number;
    pending: number;
    resolution_rate: number;
    average_resolution_time: number;
}

interface OverallStat {
    total_tickets: number;
    assigned: number;
    unassigned: number;
    open: number;
    in_progress: number;
    resolved: number;
    closed: number;
    pending: number;
}

export default function AssigneeReport({
    assigneeStatistics,
    overallStats,
    startDate,
    endDate,
}: PageProps<{
    assigneeStatistics: AssigneeStatistic[];
    overallStats: OverallStat;
    startDate: string;
    endDate: string;
}>) {
    const [filterStartDate, setFilterStartDate] = useState(startDate);
    const [filterEndDate, setFilterEndDate] = useState(endDate);

    const handleFilterChange = () => {
        router.get(route('reports.assignee'), {
            start_date: filterStartDate,
            end_date: filterEndDate,
        });
    };

    const handleExport = () => {
        const exportUrl = new URL(route('reports.assignee.export'), window.location.origin);
        exportUrl.searchParams.append('start_date', filterStartDate);
        exportUrl.searchParams.append('end_date', filterEndDate);
        window.location.href = exportUrl.toString();
    };

    const getTeamBadge = (team: string | null) => {
        if (team === 'IT') return 'bg-blue-100 text-blue-800';
        if (team === 'IPSRS') return 'bg-purple-100 text-purple-800';
        return 'bg-gray-100 text-gray-600';
    };

    const getRateColor = (rate: number) => {
        if (rate >= 80) return 'bg-green-500';
        if (rate >= 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Laporan Kinerja Petugas
                </h2>
            }
        >
            <Head title="Laporan Kinerja Petugas" />

            <div className="py-12">
                <div className="w-full max-w-none space-y-6 sm:px-6 lg:px-8">

                    {/* Filter */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900">Filter</h3>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Tanggal Mulai
                                </label>
                                <input
                                    type="date"
                                    value={filterStartDate}
                                    onChange={(e) => setFilterStartDate(e.target.value)}
                                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Tanggal Akhir
                                </label>
                                <input
                                    type="date"
                                    value={filterEndDate}
                                    onChange={(e) => setFilterEndDate(e.target.value)}
                                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                />
                            </div>
                            <div className="flex items-end gap-2">
                                <button
                                    onClick={handleFilterChange}
                                    className="flex-1 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:from-teal-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all duration-200"
                                >
                                    Terapkan
                                </button>
                                <button
                                    onClick={handleExport}
                                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="7 10 12 15 17 10" />
                                        <line x1="12" x2="12" y1="15" y2="3" />
                                    </svg>
                                    Export
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Overall Stats */}
                    <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
                        {[
                            { label: 'Total Tiket', value: overallStats.total_tickets, color: 'text-gray-900' },
                            { label: 'Di-assign', value: overallStats.assigned, color: 'text-teal-600' },
                            { label: 'Belum Di-assign', value: overallStats.unassigned, color: 'text-orange-500' },
                            { label: 'Buka', value: overallStats.open, color: 'text-blue-600' },
                            { label: 'Proses', value: overallStats.in_progress, color: 'text-yellow-600' },
                            { label: 'Terselesaikan', value: overallStats.resolved, color: 'text-green-600' },
                            { label: 'Ditutup', value: overallStats.closed, color: 'text-gray-600' },
                            { label: 'Pending', value: overallStats.pending, color: 'text-red-600' },
                        ].map((stat) => (
                            <div key={stat.label} className="rounded-lg border border-gray-200 bg-white p-4 shadow">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    {stat.label}
                                </p>
                                <p className={`mt-2 text-2xl font-bold ${stat.color}`}>
                                    {stat.value}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Assignee Table */}
                    <div className="rounded-lg border border-gray-200 bg-white shadow">
                        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Detail Kinerja Per Petugas
                            </h3>
                            <span className="text-sm text-gray-500">
                                {assigneeStatistics.length} petugas
                            </span>
                        </div>

                        {assigneeStatistics.length === 0 ? (
                            <div className="px-6 py-12 text-center text-gray-500">
                                Tidak ada data petugas pada periode ini.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="border-b border-gray-200 bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                                                Petugas
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-700">
                                                Total Assigned
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-700">
                                                Buka
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-700">
                                                Proses
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-700">
                                                Terselesaikan
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-700">
                                                Ditutup
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-700">
                                                Pending
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-700">
                                                Rata-rata Waktu
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-700">
                                                Tingkat Resolusi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {assigneeStatistics.map((a) => (
                                            <tr key={a.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-semibold text-gray-900">
                                                        {a.name}
                                                    </div>
                                                    <div className="mt-1 flex items-center gap-2">
                                                        {a.team && (
                                                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${getTeamBadge(a.team)}`}>
                                                                {a.team}
                                                            </span>
                                                        )}
                                                        {a.employee_id && (
                                                            <span className="text-xs text-gray-500">
                                                                {a.employee_id}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center text-sm font-bold text-gray-900">
                                                    {a.total_assigned}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                                                        {a.open}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">
                                                        {a.in_progress}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                                                        {a.resolved}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800">
                                                        {a.closed}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">
                                                        {a.pending}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center text-sm text-gray-600">
                                                    {a.average_resolution_time > 0
                                                        ? `${a.average_resolution_time} jam`
                                                        : '-'}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <div className="h-2 w-20 rounded-full bg-gray-200">
                                                            <div
                                                                className={`h-full rounded-full ${getRateColor(a.resolution_rate)}`}
                                                                style={{ width: `${a.resolution_rate}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-semibold text-gray-700 w-10 text-right">
                                                            {a.resolution_rate}%
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
