import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, router, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useEffect, useState, useRef } from 'react';
import { playNotificationSound } from '@/utils/soundNotification';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const page = usePage();
    const user = page.props.auth.user;
    const dbHost = page.props.db_host ?? '100.20.30.254';
    const dbPort = page.props.db_port ?? '5432';
    const dbName = page.props.db_name ?? 'helpdesk_dev';
    const notifications = page.props.notifications;
    const unreadCount = notifications?.unread_count ?? 0;
    const notificationItems = notifications?.items ?? [];
    const [soundEnabled, setSoundEnabled] = useState(() => {
        const saved = localStorage.getItem('notificationSoundEnabled');
        return saved !== 'false';
    });
    const previousUnreadCountRef = useRef(unreadCount);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
        const intervalId = window.setInterval(() => {
            if (document.visibilityState !== 'visible') return;

            router.reload({
                only: ['notifications'],
            });
        }, 15000);

        return () => window.clearInterval(intervalId);
    }, []);

    useEffect(() => {
        localStorage.setItem('notificationSoundEnabled', String(soundEnabled));
    }, [soundEnabled]);

    useEffect(() => {
        if (unreadCount > previousUnreadCountRef.current && previousUnreadCountRef.current !== undefined) {
            // Play sound if enabled
            if (soundEnabled) {
                playNotificationSound();
            }
            
            // Show toast for new notification
            const newNotification = notificationItems.find(n => !n.read_at);
            if (newNotification) {
                const data = newNotification.data as Record<string, unknown>;
                const ticketCode = (data.ticket_code as string | undefined) ?? '';
                const ticketTitle = (data.ticket_title as string | undefined) ?? '';
                const actorName = (data.actor_name as string | undefined) ?? 'Seseorang';
                const message = ticketCode 
                    ? `Tiket baru masuk: ${ticketCode} - ${ticketTitle} dari ${actorName}`
                    : `Notifikasi baru dari ${actorName}`;
                setToastMessage(message);
                setShowToast(true);
                
                // Auto hide toast after 5 seconds
                setTimeout(() => setShowToast(false), 5000);
            }
        }
        previousUnreadCountRef.current = unreadCount;
    }, [unreadCount, soundEnabled, notificationItems]);

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    
    // Distinguish between My Tickets and Ticket Client based on URL search params
    const isTicketsRoute = route().current('tickets.index');
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams(page.url.split('?')[1] || '');
    const viewModeParam = urlParams.get('view_mode');
    
    // Default to 'personal' if no view_mode is set, unless the user is an admin/staff where default is 'client'
    const isClientDefault = user.role === 'admin' || user.role === 'it' || user.role === 'ipsrs' || Boolean(user.team);
    const currentViewMode = viewModeParam || (isClientDefault ? 'client' : 'personal');
    
    const myTicketsActive = isTicketsRoute && currentViewMode === 'personal';
    const ticketClientActive = isTicketsRoute && currentViewMode === 'client';
    
    const ticketsMenuParentActive = myTicketsActive || route().current('tickets.create');
    const [ticketMenuOpen, setTicketMenuOpen] = useState(ticketsMenuParentActive);
    const canManageUsers = user.role === 'admin' || user.role === 'supervisor';
    const showTicketMenu = user.role !== 'member';

    const sidebarWidthClass = sidebarCollapsed ? 'w-20' : 'w-72';

    const SidebarIcon = ({ children: iconChildren, active = false }: PropsWithChildren<{ active?: boolean }>) => (
        <span className={
            'inline-flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 ' +
            (active 
                ? 'bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-xl shadow-teal-500/40 scale-105' 
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:scale-105')
        }>
            {iconChildren}
        </span>
    );

    const SidebarItem = ({
        href,
        active,
        label,
        icon,
    }: {
        href: string;
        active: boolean;
        label: string;
        icon: ReactNode;
    }) => (
        <Link
            href={href}
            className={
                'flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition-all duration-300 group ' +
                (active
                    ? 'bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-700 shadow-md'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900')
            }
        >
            <SidebarIcon active={active}>{icon}</SidebarIcon>
            {!sidebarCollapsed && <span className="truncate">{label}</span>}
        </Link>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
            {/* Toast Notification */}
            {showToast && (
                <div className="fixed top-4 right-4 z-50 flex items-center gap-3 rounded-2xl bg-white px-6 py-4 shadow-xl border border-slate-200 animate-in slide-in-from-top-2 fade-in duration-300">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-lg">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="h-5 w-5"
                        >
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <div className="text-sm font-bold text-slate-900">Notifikasi Baru</div>
                        <div className="text-xs text-slate-600">{toastMessage}</div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowToast(false)}
                        className="ml-2 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-all duration-200"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="h-4 w-4"
                        >
                            <path d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}
            <div className="flex min-h-screen">
                <aside
                    className={
                        'hidden shrink-0 border-r border-slate-200/50 bg-gradient-to-b from-white to-slate-50 md:flex md:flex-col shadow-xl shadow-slate-200/50 ' +
                        sidebarWidthClass
                    }
                >
                    <div className="flex h-28 items-center justify-between gap-3 px-4 border-b border-slate-100">
                        <Link
                            href="/"
                            className={
                                'flex items-center ' +
                                (sidebarCollapsed ? 'w-full justify-center' : '')
                            }
                        >
                            <ApplicationLogo
                                variant={sidebarCollapsed ? 'icon' : 'full'}
                                className={
                                    sidebarCollapsed
                                        ? 'block h-14 w-14 drop-shadow-lg'
                                        : 'block h-24 w-auto drop-shadow-lg'
                                }
                            />
                        </Link>

                        <button
                            type="button"
                            onClick={() => setSidebarCollapsed((v) => !v)}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-r from-slate-100 to-slate-50 text-slate-600 hover:from-slate-200 hover:to-slate-100 hover:text-slate-800 hover:scale-110 focus:outline-none transition-all duration-300 shadow-sm"
                            aria-label="Toggle sidebar"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className={
                                    'h-6 w-6 transition-all duration-300 ' +
                                    (sidebarCollapsed ? 'rotate-180' : '')
                                }
                            >
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                        </button>
                    </div>

                    <div className="px-4 py-6">
                        {!sidebarCollapsed && (
                            <div className="px-3 pb-4 text-xs font-bold tracking-widest text-slate-400 uppercase">
                                Main Menu
                            </div>
                        )}

                        <div className="space-y-2">
                            <SidebarItem
                                href={route('dashboard')}
                                active={route().current('dashboard')}
                                label="Home"
                                icon={
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-6 w-6"
                                    >
                                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                        <polyline points="9 22 9 12 15 12 15 22" />
                                    </svg>
                                }
                            />

                            {/* <SidebarItem
                                href={route('tickets.index', { view_mode: 'personal' })}
                                active={myTicketsActive}
                                label="My Tickets"
                                icon={
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className="h-5 w-5"
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
                                }
                            /> */}

                            {showTicketMenu && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => setTicketMenuOpen((v) => !v)}
                                        className={
                                            'flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold transition-all duration-200 ' +
                                            (ticketsMenuParentActive
                                                ? 'bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-700 shadow-sm'
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900')
                                        }
                                    >
                                        <SidebarIcon active={ticketsMenuParentActive}>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="h-6 w-6"
                                            >
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                <polyline points="14 2 14 8 20 8" />
                                                <line x1="16" x2="8" y1="13" y2="13" />
                                                <line x1="16" x2="8" y1="17" y2="17" />
                                                <polyline points="10 9 9 9 8 9" />
                                            </svg>
                                        </SidebarIcon>
                                        {!sidebarCollapsed && (
                                            <>
                                                <span className="truncate">Ticket</span>
                                                <span className="ml-auto inline-flex items-center text-slate-400">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                        className={
                                                            'h-4 w-4 transition-all duration-300 ' +
                                                            (ticketMenuOpen
                                                                ? 'rotate-90'
                                                                : '')
                                                        }
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M7.21 14.77a.75.75 0 01.02-1.06L10.94 10 7.23 6.29a.75.75 0 111.06-1.06l4.24 4.24a.75.75 0 010 1.06l-4.24 4.24a.75.75 0 01-1.06.02z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </span>
                                            </>
                                        )}
                                    </button>

                                    {!sidebarCollapsed && ticketMenuOpen && (
                                        <div className="ml-4 space-y-2 border-l-2 border-teal-200 pl-4">
                                            <NavLink
                                                href={route('tickets.create')}
                                                active={route().current('tickets.create')}
                                            >
                                                Create Ticket
                                            </NavLink>
                                        </div>
                                    )}
                                </>
                            )}

                            <SidebarItem
                                href={route('tickets.index', { view_mode: 'client' })}
                                active={ticketClientActive}
                                label="Ticket Client"
                                icon={
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-6 w-6"
                                    >
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                }
                            />

                            {canManageUsers && (
                                <SidebarItem
                                    href={route('users.index')}
                                    active={route().current('users.*')}
                                    label="Users"
                                    icon={
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-6 w-6"
                                        >
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                            <circle cx="9" cy="7" r="4" />
                                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                        </svg>
                                    }
                                />
                            )}

                            {canManageUsers && (
                                <div>
                                    <div className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${route().current('reports.*') ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-100'}`}>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-6 w-6 shrink-0"
                                        >
                                            <polyline points="3 3 7 3 7 7 3 7 3 3" />
                                            <polyline points="14 3 18 3 18 7 14 7 14 3" />
                                            <polyline points="14 13 18 13 18 17 14 17 14 13" />
                                            <polyline points="3 13 7 13 7 17 3 17 3 13" />
                                        </svg>
                                        {!sidebarCollapsed && <span>Laporan</span>}
                                    </div>
                                    {!sidebarCollapsed && (
                                        <div className="ml-9 mt-1 flex flex-col gap-0.5">
                                            <a
                                                href={route('reports.unit')}
                                                className={`rounded-lg px-3 py-1.5 text-sm transition-all duration-150 ${route().current('reports.unit') ? 'font-semibold text-teal-600' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
                                            >
                                                Per Unit
                                            </a>
                                            <a
                                                href={route('reports.assignee')}
                                                className={`rounded-lg px-3 py-1.5 text-sm transition-all duration-150 ${route().current('reports.assignee') ? 'font-semibold text-teal-600' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
                                            >
                                                Per Petugas
                                            </a>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {!sidebarCollapsed && (
                        <div className="mt-auto border-t border-slate-200/50 px-4 py-4 bg-gradient-to-t from-white to-transparent">
                            <div className="text-center text-[11px] font-semibold text-slate-500">
                                <div className="flex items-center justify-center gap-2 mb-1">
                                    <div className="h-2 w-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 animate-pulse"></div>
                                    Support Tiket (DK) v.1.0.0
                                </div>
                            </div>
                        </div>
                    )}
                </aside>


                <div className="flex min-w-0 flex-1 flex-col">
                    <div className="border-b border-slate-200/70 bg-white/80 backdrop-blur-xl shadow-sm z-40 relative">
                        <div className="flex h-18 items-center justify-between gap-4 px-6 sm:px-8 lg:px-10">
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowingNavigationDropdown(
                                            (previousState) => !previousState,
                                        )
                                    }
                                    className="inline-flex items-center justify-center rounded-xl p-2.5 text-slate-500 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 hover:text-slate-700 focus:outline-none transition-all duration-200 md:hidden"
                                >
                                    <svg
                                        className="h-6 w-6"
                                        stroke="currentColor"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            className={
                                                !showingNavigationDropdown
                                                    ? 'inline-flex'
                                                    : 'hidden'
                                            }
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                        <path
                                            className={
                                                showingNavigationDropdown
                                                    ? 'inline-flex'
                                                    : 'hidden'
                                            }
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>

                                <div className="flex items-center gap-3 md:hidden">
                                    <Link href="/" className="flex items-center">
                                        <ApplicationLogo className="block h-12 w-auto drop-shadow-lg" />
                                    </Link>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => setSoundEnabled(!soundEnabled)}
                                    className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-slate-100 to-slate-50 text-slate-600 hover:from-slate-200 hover:to-slate-100 hover:text-slate-800 hover:scale-110 focus:outline-none transition-all duration-300 shadow-sm"
                                    title={soundEnabled ? 'Matikan suara notifikasi' : 'Aktifkan suara notifikasi'}
                                >
                                    {soundEnabled ? (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth="2"
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-6 w-6 text-teal-600"
                                        >
                                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                                        </svg>
                                    ) : (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth="2"
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-6 w-6 text-slate-500"
                                        >
                                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                                            <line x1="22" x2="16" y1="9" y2="15" />
                                            <line x1="16" x2="22" y1="9" y2="15" />
                                        </svg>
                                    )}
                                </button>
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-slate-100 to-slate-50 text-slate-600 hover:from-slate-200 hover:to-slate-100 hover:text-slate-800 hover:scale-110 focus:outline-none transition-all duration-300 shadow-sm">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth="2"
                                                stroke="currentColor"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="h-6 w-6"
                                            >
                                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                            </svg>
                                            {unreadCount > 0 && (
                                                <span className="absolute -right-1 -top-1 inline-flex min-w-[22px] items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-1.5 py-0.5 text-[11px] font-bold leading-none text-white shadow-xl shadow-rose-500/50">
                                                    {unreadCount > 99 ? '99+' : unreadCount}
                                                </span>
                                            )}
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content
                                        align="right"
                                        width="96"
                                        contentClasses="bg-white py-0"
                                    >
                                        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-gradient-to-r from-slate-50 to-white">
                                            <div className="text-sm font-semibold text-slate-900">
                                                Notifikasi
                                            </div>
                                            <Dropdown.Link
                                                href={route('notifications.readAll')}
                                                method="post"
                                                as="button"
                                                className="px-0 py-0 text-xs font-semibold text-teal-600 hover:bg-transparent hover:text-teal-700"
                                            >
                                                Tandai semua dibaca
                                            </Dropdown.Link>
                                        </div>

                                        <div className="max-h-[360px] overflow-auto py-1">
                                            {notificationItems.length === 0 ? (
                                                <div className="px-4 py-8 text-center text-sm text-slate-500">
                                                    <div className="mb-2 text-3xl">🔔</div>
                                                    Belum ada notifikasi.
                                                </div>
                                            ) : (
                                                notificationItems.map((n) => {
                                                    const data = n.data as Record<string, unknown>;
                                                    const actorName =
                                                        (data.actor_name as string | undefined) ??
                                                        'Seseorang';
                                                    const ticketCode =
                                                        (data.ticket_code as string | undefined) ??
                                                        '';
                                                    const ticketTitle =
                                                        (data.ticket_title as string | undefined) ??
                                                        '';
                                                    const message =
                                                        (data.message as string | undefined) ?? '';
                                                    const createdAt = n.created_at
                                                        ? new Date(n.created_at).toLocaleString(
                                                              'id-ID',
                                                          )
                                                        : '';

                                                    return (
                                                        <Dropdown.Link
                                                            key={n.id}
                                                            href={route('notifications.go', n.id)}
                                                            className={
                                                                'px-4 py-3 transition-all duration-200 ' +
                                                                (n.read_at
                                                                    ? 'bg-white hover:bg-slate-50'
                                                                    : 'bg-gradient-to-r from-teal-50 to-cyan-50 hover:from-teal-100 hover:to-cyan-100')
                                                            }
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                <div className={
                                                                    'mt-0.5 h-3 w-3 shrink-0 rounded-full ' +
                                                                    (n.read_at ? 'bg-slate-300' : 'bg-gradient-to-r from-teal-500 to-cyan-500 animate-pulse')
                                                                } />
                                                                <div className="min-w-0">
                                                                    <div className="text-sm font-semibold text-slate-900">
                                                                        {actorName}
                                                                    </div>
                                                                    <div className="mt-0.5 text-xs text-slate-600">
                                                                        {ticketCode !== ''
                                                                            ? `${ticketCode} • ${ticketTitle}`
                                                                            : ticketTitle}
                                                                    </div>
                                                                    {message !== '' && (
                                                                        <div className="mt-1 text-xs text-slate-700">
                                                                            {message}
                                                                        </div>
                                                                    )}
                                                                    {createdAt !== '' && (
                                                                        <div className="mt-1 text-[11px] text-slate-400">
                                                                            {createdAt}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </Dropdown.Link>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </Dropdown.Content>
                                </Dropdown>

                                <div className="relative">
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <span className="inline-flex rounded-2xl">
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-gradient-to-r from-white to-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-300 hover:from-slate-50 hover:to-slate-100 hover:border-slate-300 hover:shadow-md hover:scale-[1.02] focus:outline-none"
                                                >
                                                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-sm font-bold text-white shadow-xl shadow-teal-500/40 overflow-hidden">
                                                        {user.avatar ? (
                                                            <img src={`/storage/${user.avatar}`} alt={user.name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            user.name.slice(0, 1).toUpperCase()
                                                        )}
                                                    </span>
                                                    <span className="hidden sm:inline">
                                                        {user.name}
                                                    </span>

                                                    <svg
                                                        className="h-4 w-4 text-slate-400 transition-transform duration-300"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </button>
                                            </span>
                                        </Dropdown.Trigger>

                                        <Dropdown.Content width="72" contentClasses="bg-white py-0">
                                            {/* Header: Selamat Datang */}
                                            <div className="border-b border-slate-200 px-4 py-3 text-center">
                                                <p className="text-sm font-semibold text-slate-700">
                                                    Selamat Datang {user.name}.
                                                </p>
                                            </div>

                                            {/* DB Info */}
                                            <div className="border-b border-slate-100 px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0 text-slate-400">
                                                        <ellipse cx="12" cy="5" rx="9" ry="3"/>
                                                        <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/>
                                                        <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/>
                                                    </svg>
                                                    <span className="text-sm text-slate-600">
                                                        {dbHost} | {dbPort} | {dbName}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Profile */}
                                            <Dropdown.Link href={route('profile.edit')}>
                                                <div className="flex items-center gap-3">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0 text-slate-400">
                                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                                        <circle cx="12" cy="7" r="4"/>
                                                    </svg>
                                                    <span>Profile</span>
                                                </div>
                                            </Dropdown.Link>

                                            {/* Ubah Password */}
                                            <Dropdown.Link href={route('profile.edit', { section: 'password' })}>
                                                <div className="flex items-center gap-3">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0 text-slate-400">
                                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                                    </svg>
                                                    <span>Ubah Password</span>
                                                </div>
                                            </Dropdown.Link>

                                            {/* Version */}
                                            <div className="border-t border-slate-100 px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0 text-slate-400">
                                                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                                                        <line x1="7" y1="7" x2="7.01" y2="7"/>
                                                    </svg>
                                                    <span className="text-sm text-slate-600">Production Version v1.0.0</span>
                                                </div>
                                            </div>

                                            {/* Logout */}
                                            <div className="border-t border-slate-200">
                                                <Dropdown.Link
                                                    href={route('logout')}
                                                    method="post"
                                                    as="button"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0 text-slate-400">
                                                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                                            <polyline points="16 17 21 12 16 7"/>
                                                            <line x1="21" y1="12" x2="9" y2="12"/>
                                                        </svg>
                                                        <span>Logout</span>
                                                    </div>
                                                </Dropdown.Link>
                                            </div>
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>
                            </div>
                        </div>

                        <div
                            className={
                                (showingNavigationDropdown ? 'block' : 'hidden') +
                                ' md:hidden'
                            }
                        >
                            <div className="space-y-2 border-t border-slate-200 px-4 py-4">
                                <ResponsiveNavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                >
                                    Home
                                </ResponsiveNavLink>
                                {/* <ResponsiveNavLink
                                    href={route('tickets.index', { view_mode: 'personal' })}
                                    active={myTicketsActive}
                                >
                                    My Tickets
                                </ResponsiveNavLink> */}
                                {showTicketMenu && (
                                    <>
                                        <ResponsiveNavLink
                                            href={route('tickets.create')}
                                            active={route().current('tickets.create')}
                                        >
                                            Create Ticket
                                        </ResponsiveNavLink>
                                    </>
                                )}
                                <ResponsiveNavLink
                                    href={route('tickets.index', { view_mode: 'client' })}
                                    active={ticketClientActive}
                                >
                                    Ticket Client
                                </ResponsiveNavLink>
                                {canManageUsers && (
                                    <ResponsiveNavLink
                                        href={route('users.index')}
                                        active={route().current('users.*')}
                                    >
                                        Users
                                    </ResponsiveNavLink>
                                )}
                            </div>

                            <div className="border-t border-slate-200 px-4 py-4">
                                <div className="text-sm font-semibold text-slate-900">
                                    {user.name}
                                </div>
                                <div className="text-sm text-slate-600">
                                    {user.email}
                                </div>
                                <div className="mt-3 space-y-1">
                                    <ResponsiveNavLink href={route('profile.edit')}>
                                        Profile
                                    </ResponsiveNavLink>
                                    <ResponsiveNavLink
                                        method="post"
                                        href={route('logout')}
                                        as="button"
                                    >
                                        Log Out
                                    </ResponsiveNavLink>
                                </div>
                            </div>
                        </div>
                    </div>

                    {header && (
                        <header className="bg-white/60 backdrop-blur-sm border-b border-slate-200/30">
                            <div className="w-full max-w-none px-6 py-5 sm:px-8 lg:px-10">
                                {header}
                            </div>
                        </header>
                    )}

                    <main className="flex-1">{children}</main>
                    <footer className="border-t border-slate-200/50 bg-white/70 backdrop-blur-sm px-6 py-4 text-center text-xs text-slate-500 sm:px-8 lg:px-10">
                        <div className="flex items-center justify-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500"></div>
                            © 2026 Informasi Teknologi Oetomo
                            <div className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500"></div>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
}
