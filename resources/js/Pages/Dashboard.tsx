import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useMemo } from 'react';
import type { ApexOptions } from 'apexcharts';
import ReactApexChart from 'react-apexcharts';

type TicketStatus = 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';

type Unit = {
    id: number;
    name: string;
    code: string;
};

type Ticket = {
    id: number;
    code: string;
    title: string;
    status: TicketStatus;
    created_at: string | null;
    project: { id: number; name: string } | null;
};

type ChartSeries = {
    name: string;
    data: number[];
};

type ChartData = {
    categories: string[];
    series: ChartSeries[];
};

type Props = PageProps<{
    unit: Unit | null;
    todayLabel: string;
    statusCounts: Record<TicketStatus, number>;
    tickets: Ticket[];
    chart: ChartData;
}>;

const statusMeta: Record<
    TicketStatus,
    { label: string; bg: string; iconBg: string; iconStroke: string }
> = {
    open: {
        label: 'Open',
        bg: 'bg-gradient-to-br from-rose-50 to-pink-100',
        iconBg: 'bg-gradient-to-br from-rose-500 to-pink-500',
        iconStroke: 'text-white',
    },
    in_progress: {
        label: 'In Progress',
        bg: 'bg-gradient-to-br from-indigo-50 to-blue-100',
        iconBg: 'bg-gradient-to-br from-indigo-500 to-blue-500',
        iconStroke: 'text-white',
    },
    pending: {
        label: 'Pending',
        bg: 'bg-gradient-to-br from-amber-50 to-orange-100',
        iconBg: 'bg-gradient-to-br from-amber-500 to-orange-500',
        iconStroke: 'text-white',
    },
    resolved: {
        label: 'Review',
        bg: 'bg-gradient-to-br from-slate-50 to-slate-100',
        iconBg: 'bg-gradient-to-br from-slate-500 to-slate-600',
        iconStroke: 'text-white',
    },
    closed: {
        label: 'Closed',
        bg: 'bg-gradient-to-br from-lime-50 to-green-100',
        iconBg: 'bg-gradient-to-br from-lime-500 to-green-500',
        iconStroke: 'text-white',
    },
};

const ticketStatusOrder: TicketStatus[] = ['open', 'in_progress', 'pending', 'resolved', 'closed'];

function formatShortDate(iso: string | null) {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function Dashboard({ auth, todayLabel, statusCounts, tickets, chart }: Props) {

    const totalCount = useMemo(
        () => ticketStatusOrder.reduce((sum, status) => sum + (statusCounts[status] ?? 0), 0),
        [statusCounts],
    );

    const chartSeries = useMemo(() => {
        const series = (chart?.series ?? []).map((s) => ({
            name: s.name,
            data: s.data,
        }));
        return series;
    }, [chart]);

    const chartOptions: ApexOptions = useMemo(() => {
        const categories = chart?.categories ?? [];

        return {
            chart: {
                type: 'area',
                toolbar: { show: true },
                zoom: { enabled: true },
                fontFamily: 'inherit',
                animations: { enabled: true },
            },
            colors: ['#10b981', '#f59e0b'],
            dataLabels: { enabled: false },
            stroke: { curve: 'smooth', width: 2 },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 0.35,
                    opacityFrom: 0.45,
                    opacityTo: 0.08,
                    stops: [0, 80, 100],
                },
            },
            grid: { borderColor: '#e2e8f0', strokeDashArray: 4 },
            legend: {
                show: true,
                position: 'top',
                horizontalAlign: 'left',
                labels: { colors: '#334155' },
            },
            xaxis: {
                type: 'datetime',
                categories,
                labels: { style: { colors: '#64748b', fontSize: '12px' } },
            },
            yaxis: {
                labels: {
                    style: { colors: '#64748b', fontSize: '12px' },
                    formatter: (value: number) => String(Math.round(value)),
                },
            },
            tooltip: {
                x: { format: 'dd MMM yyyy' },
                y: {
                    formatter: (value: number) => String(Math.abs(Math.round(value))),
                },
            },
        };
    }, [chart]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg shadow-teal-500/30">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6 text-white">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-900">Dashboard</div>
                            <div className="mt-1 text-sm text-slate-500">
                                Selamat datang kembali, <span className="font-semibold text-teal-600">{auth.user.name}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-3 shadow-sm border border-slate-200">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div className="text-sm font-semibold text-slate-700">{todayLabel}</div>
                    </div>
                </div>
            }
        >
            <Head title="Home" />

            <div className="py-8">
                <div className="w-full max-w-none space-y-6 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                        <div className="lg:col-span-12">
                            <div className="relative overflow-hidden rounded-3xl bg-white shadow-xl border border-slate-200">
                                <div className="absolute top-0 right-0 h-64 w-64 bg-gradient-to-bl from-teal-100 to-cyan-100 opacity-50 blur-3xl"></div>
                                <div className="absolute bottom-0 left-0 h-64 w-64 bg-gradient-to-tr from-blue-100 to-indigo-100 opacity-50 blur-3xl"></div>
                                
                                <div className="relative border-b border-slate-100 px-8 pt-8 pb-6">
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 text-sm font-semibold text-teal-600">
                                                <div className="h-2 w-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 animate-pulse"></div>
                                                Home • Overview
                                            </div>
                                            <h2 className="mt-2 text-3xl font-bold text-slate-900">
                                                Selamat Datang, {auth.user.name}!
                                            </h2>
                                            <p className="mt-2 text-slate-500">
                                                Berikut adalah ringkasan tiket yang tersedia saat ini
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative grid grid-cols-1 gap-4 px-8 pb-6 pt-2 md:grid-cols-5">
                                    {ticketStatusOrder.map((status) => (
                                        <div
                                            key={status}
                                            className={
                                                'group relative overflow-hidden rounded-2xl border border-slate-100 p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ' +
                                                statusMeta[status].bg
                                            }
                                        >
                                            <div className="text-xs font-bold uppercase tracking-widest text-slate-600">
                                                {statusMeta[status].label}
                                            </div>
                                            <div className="mt-3 flex items-center justify-between">
                                                <div className="text-3xl font-bold text-slate-900">
                                                    {statusCounts[status] ?? 0}
                                                </div>
                                                <div
                                                    className={
                                                        'flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg transition-all duration-300 group-hover:scale-110 ' +
                                                        statusMeta[status].iconBg
                                                    }
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        className={
                                                            'h-6 w-6 ' +
                                                            statusMeta[status].iconStroke
                                                        }
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M7.5 8.25h9m-9 3.75h9m-9 3.75h6M6 3.75h12A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6A2.25 2.25 0 016 3.75z"
                                                        />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>


                            </div>

                            <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6">
                                <h3 className="text-lg font-bold text-slate-900 mb-4">Chart Aktivitas Tiket</h3>
                                <ReactApexChart options={chartOptions} series={chartSeries} type="area" height={350} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
