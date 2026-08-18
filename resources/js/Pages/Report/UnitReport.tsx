import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

interface UnitStatistic {
    id: number;
    name: string;
    code: string;
    total_tickets: number;
    open: number;
    in_progress: number;
    resolved: number;
    closed: number;
    pending: number;
    average_resolution_time: number;
}

interface OverallStat {
    total_tickets: number;
    open: number;
    in_progress: number;
    resolved: number;
    closed: number;
    pending: number;
}

export default function UnitReport({
    unitStatistics,
    overallStats,
    topUnits,
    startDate,
    endDate,
}: PageProps<{
    unitStatistics: UnitStatistic[];
    overallStats: OverallStat;
    topUnits: UnitStatistic[];
    startDate: string;
    endDate: string;
}>) {
    const [filterStartDate, setFilterStartDate] = useState(startDate);
    const [filterEndDate, setFilterEndDate] = useState(endDate);

    const handleFilterChange = () => {
        router.get(route('reports.unit'), {
            start_date: filterStartDate,
            end_date: filterEndDate,
        });
    };

    const handleExport = () => {
        const exportUrl = new URL(route('reports.unit.export'), window.location.origin);
        exportUrl.searchParams.append('start_date', filterStartDate);
        exportUrl.searchParams.append('end_date', filterEndDate);
        window.location.href = exportUrl.toString();
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            open: 'bg-blue-100 text-blue-800',
            in_progress: 'bg-yellow-100 text-yellow-800',
            resolved: 'bg-green-100 text-green-800',
            closed: 'bg-gray-100 text-gray-800',
            pending: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getResolutionRate = (unit: UnitStatistic) => {
        if (unit.total_tickets === 0) return 0;
        return Math.round(((unit.closed + unit.resolved) / unit.total_tickets) * 100);
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Laporan Unit
                </h2>
            }
        >
            <Head title="Laporan Unit" />

            <div className="py-12">
                <div className="w-full max-w-none space-y-6 sm:px-6 lg:px-8">
                    {/* Date Range Filter */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900">
                            Filter Periode
                        </h3>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Tanggal Mulai
                                </label>
                                <input
                                    type="date"
                                    value={filterStartDate}
                                    onChange={(e) =>
                                        setFilterStartDate(e.target.value)
                                    }
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
                                    onChange={(e) =>
                                        setFilterEndDate(e.target.value)
                                    }
                                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                />
                            </div>
                            <div className="flex items-end gap-2">
                                <button
                                    onClick={handleFilterChange}
                                    className="flex-1 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:from-teal-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all duration-200"
                                >
                                    Terapkan Filter
                                </button>
                                <button
                                    onClick={handleExport}
                                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className="h-4 w-4"
                                    >
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="7 10 12 15 17 10" />
                                        <line x1="12" x2="12" y1="15" y2="3" />
                                    </svg>
                                    Export CSV
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Overall Statistics */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
                        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Total Tiket
                            </p>
                            <p className="mt-2 text-2xl font-bold text-gray-900">
                                {overallStats.total_tickets}
                            </p>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
                            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                                Buka
                            </p>
                            <p className="mt-2 text-2xl font-bold text-blue-600">
                                {overallStats.open}
                            </p>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
                            <p className="text-xs font-semibold uppercase tracking-wide text-yellow-600">
                                Proses
                            </p>
                            <p className="mt-2 text-2xl font-bold text-yellow-600">
                                {overallStats.in_progress}
                            </p>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
                            <p className="text-xs font-semibold uppercase tracking-wide text-green-600">
                                Terselesaikan
                            </p>
                            <p className="mt-2 text-2xl font-bold text-green-600">
                                {overallStats.resolved}
                            </p>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                                Ditutup
                            </p>
                            <p className="mt-2 text-2xl font-bold text-gray-600">
                                {overallStats.closed}
                            </p>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
                            <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                                Pending
                            </p>
                            <p className="mt-2 text-2xl font-bold text-red-600">
                                {overallStats.pending}
                            </p>
                        </div>
                    </div>

                    {/* Top Performing Units */}
                    {topUnits.length > 0 && (
                        <div className="rounded-lg border border-gray-200 bg-white shadow">
                            <div className="border-b border-gray-200 px-6 py-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Unit Terbaik (Tingkat Resolusi Tertinggi)
                                </h3>
                            </div>
                            <div className="grid gap-4 p-6 md:grid-cols-2 lg:grid-cols-3">
                                {topUnits.map((unit) => (
                                    <div
                                        key={unit.id}
                                        className="rounded-lg border border-gray-200 p-4"
                                    >
                                        <p className="font-semibold text-gray-900">
                                            {unit.name}
                                        </p>
                                        <p className="mt-2 text-sm text-gray-600">
                                            Tingkat Resolusi:{' '}
                                            <span className="font-bold text-green-600">
                                                {getResolutionRate(unit)}%
                                            </span>
                                        </p>
                                        <p className="mt-1 text-sm text-gray-600">
                                            Total Tiket: {unit.total_tickets}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Unit Statistics Table */}
                    <div className="rounded-lg border border-gray-200 bg-white shadow">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Statistik Per Unit
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-gray-200 bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                                            Unit
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-700">
                                            Total
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
                                    {unitStatistics.map((unit) => (
                                        <tr
                                            key={unit.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-semibold text-gray-900">
                                                    {unit.name}
                                                </div>
                                                <div className="text-xs text-gray-600">
                                                    {unit.code}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                                                {unit.total_tickets}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor('open')}`}>
                                                    {unit.open}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor('in_progress')}`}>
                                                    {unit.in_progress}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor('resolved')}`}>
                                                    {unit.resolved}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor('closed')}`}>
                                                    {unit.closed}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor('pending')}`}>
                                                    {unit.pending}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center text-sm text-gray-600">
                                                {unit.average_resolution_time > 0
                                                    ? `${unit.average_resolution_time} jam`
                                                    : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center">
                                                    <div className="h-2 w-24 rounded-full bg-gray-200">
                                                        <div
                                                            className="h-full rounded-full bg-green-500"
                                                            style={{
                                                                width: `${getResolutionRate(unit)}%`,
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="ml-2 text-xs font-semibold text-gray-700">
                                                        {getResolutionRate(unit)}%
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
