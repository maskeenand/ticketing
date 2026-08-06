import { useEffect, useMemo, useRef, useState } from 'react';

function pad2(v: number) {
    return String(v).padStart(2, '0');
}

function toIsoDate(d: Date) {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function parseIsoDate(value: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const d = new Date(`${value}T00:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
}

function formatInputDate(value: string) {
    const d = parseIsoDate(value);
    if (!d) return '';
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function startOfMonth(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, delta: number) {
    return new Date(d.getFullYear(), d.getMonth() + delta, 1);
}

function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function buildCalendarDays(viewMonth: Date) {
    const first = startOfMonth(viewMonth);
    const start = new Date(first);
    start.setDate(first.getDate() - first.getDay());

    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        days.push(d);
    }
    return days;
}

type Props = {
    id?: string;
    value: string;
    onChange: (next: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
};

export default function DatePicker({ id, value, onChange, placeholder, disabled, className }: Props) {
    const anchorRef = useRef<HTMLDivElement | null>(null);
    const [open, setOpen] = useState(false);

    const selected = useMemo(() => parseIsoDate(value), [value]);
    const [temp, setTemp] = useState<Date | null>(selected);
    const [viewMonth, setViewMonth] = useState<Date>(() => startOfMonth(selected ?? new Date()));

    useEffect(() => {
        if (!open) return;
        setTemp(selected);
        setViewMonth(startOfMonth(selected ?? new Date()));
    }, [open, selected]);

    useEffect(() => {
        const onMouseDown = (e: MouseEvent) => {
            if (!open) return;
            const el = anchorRef.current;
            if (!el) return;
            if (e.target instanceof Node && !el.contains(e.target)) setOpen(false);
        };
        window.addEventListener('mousedown', onMouseDown);
        return () => window.removeEventListener('mousedown', onMouseDown);
    }, [open]);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (!open) return;
            if (e.key === 'Escape') setOpen(false);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [open]);

    const days = useMemo(() => buildCalendarDays(viewMonth), [viewMonth]);
    const monthLabel = useMemo(() => {
        const month = viewMonth.toLocaleString('id-ID', { month: 'long' });
        return { month, year: viewMonth.getFullYear() };
    }, [viewMonth]);

    const displayed = value ? formatInputDate(value) : '';

    return (
        <div ref={anchorRef} className={'relative ' + (className ?? '')}>
            <button
                id={id}
                type="button"
                disabled={disabled}
                onClick={() => setOpen((v) => !v)}
                className={
                    'flex w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 ' +
                    (disabled ? 'opacity-60' : '')
                }
            >
                <span className={displayed ? 'text-slate-900' : 'text-slate-400'}>
                    {displayed || placeholder || 'Pilih Tanggal'}
                </span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="h-5 w-5 text-slate-400"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                </svg>
            </button>

            {open && (
                <div className="absolute left-0 top-full z-50 mt-2 w-[340px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
                    <div className="flex items-center justify-between px-4 py-3">
                        <button
                            type="button"
                            onClick={() => setViewMonth((m) => addMonths(m, -1))}
                            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            aria-label="Prev month"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                className="h-5 w-5"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                            </svg>
                        </button>

                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <span className="capitalize">{monthLabel.month}</span>
                            <span>{monthLabel.year}</span>
                        </div>

                        <button
                            type="button"
                            onClick={() => setViewMonth((m) => addMonths(m, 1))}
                            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            aria-label="Next month"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                className="h-5 w-5"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 px-4 pb-2 text-center text-xs font-semibold text-slate-400">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                            <div key={d} className="py-1">
                                {d}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1 px-4 pb-3">
                        {days.map((d) => {
                            const inMonth = d.getMonth() === viewMonth.getMonth();
                            const isSelected = temp ? isSameDay(d, temp) : false;

                            return (
                                <button
                                    key={toIsoDate(d)}
                                    type="button"
                                    onClick={() => {
                                        setTemp(d);
                                        onChange(toIsoDate(d));
                                        setOpen(false);
                                    }}
                                    className={
                                        'h-9 w-9 rounded-full text-sm font-semibold transition ' +
                                        (isSelected
                                            ? 'bg-slate-100 text-slate-900'
                                            : inMonth
                                                ? 'text-slate-700 hover:bg-slate-50'
                                                : 'text-slate-300 hover:bg-slate-50')
                                    }
                                >
                                    {d.getDate()}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
