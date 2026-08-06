import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import JoditEditor from 'jodit-react';
import { FormEvent, useEffect, useMemo, useRef } from 'react';
import { PageProps } from '@/types';
import { playSuccessSound } from '@/utils/soundNotification';

type TicketStatus = 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';

type Person = { id: number; name: string };
type Project = { id: number; name: string };

type Ticket = {
  id: number;
  code: string;
  title: string;
  description?: string | null;
  status: TicketStatus;
  priority: 'low' | 'medium' | 'high';
  category?: string | null;
  type?: string | null;
  created_at: string;
  project: Project | null;
  requester?: Person | null;
  creator?: Person | null;
  assignee?: Person | null;
  attachments?: unknown;
};

type TicketAttachment = {
    path: string;
    original_name: string;
    mime?: string | null;
    size?: number | null;
};

type Comment = {
  id: number;
  user: Person;
  body: string;
  attachments?: unknown;
  created_at: string;
};

type Props = PageProps<{
    ticket: Ticket;
    comments: Comment[];
    canEdit: boolean;
    availableAssignees: { id: number; name: string }[];
}>;

function statusLabel(s: TicketStatus) {
  if (s === 'open') return 'Open';
  if (s === 'in_progress') return 'In Progress';
  if (s === 'pending') return 'Pending';
  if (s === 'resolved') return 'Review';
  return 'Closed';
}

function priorityLabel(p: Ticket['priority']) {
  if (p === 'high') return 'High';
  if (p === 'medium') return 'Medium';
  return 'Low';
}

function statusBadgeClass(s: TicketStatus) {
  if (s === 'open') return 'bg-rose-500 text-white';
  if (s === 'in_progress') return 'bg-indigo-500 text-white';
  if (s === 'pending') return 'bg-amber-500 text-white';
  if (s === 'resolved') return 'bg-emerald-500 text-white';
  return 'bg-slate-500 text-white';
}

function priorityBadgeClass(p: Ticket['priority']) {
  if (p === 'high') return 'bg-rose-500 text-white';
  if (p === 'medium') return 'bg-amber-500 text-white';
  return 'bg-emerald-500 text-white';
}

function normalizeAttachments(value: unknown): TicketAttachment[] {
  const isAttachment = (v: unknown): v is TicketAttachment => {
    if (!v || typeof v !== 'object') return false;
    const record = v as Record<string, unknown>;
    return typeof record.path === 'string' && typeof record.original_name === 'string';
  };

  if (Array.isArray(value)) {
    return value.filter(isAttachment);
  }

  if (value && typeof value === 'object') {
    return Object.values(value).filter(isAttachment);
  }

  return [];
}

function formatRelativeTime(dateIso: string): string {
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) return '';

  const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const absSeconds = Math.abs(diffSeconds);

  const rtf = new Intl.RelativeTimeFormat('id-ID', { numeric: 'auto' });

  const minute = 60;
  const hour = 60 * minute;
  const day = 24 * hour;
  const month = 30 * day;
  const year = 365 * day;

  if (absSeconds >= year) return rtf.format(Math.round(diffSeconds / year), 'year');
  if (absSeconds >= month) return rtf.format(Math.round(diffSeconds / month), 'month');
  if (absSeconds >= day) return rtf.format(Math.round(diffSeconds / day), 'day');
  if (absSeconds >= hour) return rtf.format(Math.round(diffSeconds / hour), 'hour');
  if (absSeconds >= minute) return rtf.format(Math.round(diffSeconds / minute), 'minute');
  return rtf.format(diffSeconds, 'second');
}

function formatDateLabel(dateIso: string): string {
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function TicketShow({ ticket, comments, canEdit, availableAssignees }: Props) {
  const { auth } = usePage<PageProps>().props;
  const { data, setData, post, patch, processing, reset } = useForm({
    body: '',
    attachments: [] as File[],
    status: ticket.status,
    priority: ticket.priority,
    type: ticket.type,
    assignee_id: ticket.assignee?.id ?? null,
  });
  const attachments = normalizeAttachments(ticket.attachments);
  const replyContainerRef = useRef<HTMLDivElement | null>(null);
  const currentUserId = auth.user?.id;

  const otherUserStyles = [
    'bg-slate-50 border-slate-200',
    'bg-emerald-50 border-emerald-200',
    'bg-amber-50 border-amber-200',
    'bg-violet-50 border-violet-200',
    'bg-rose-50 border-rose-200',
  ];

  const isEditorEmpty = (() => {
    const html = (data.body ?? '').trim();
    return html === '' || html === '<br>' || html === '<div><br></div>' || html === '<p><br></p>';
  })();
  const editorConfig = useMemo(
    () => ({
      readonly: false,
      placeholder: 'Write reply here..',
      height: 200,
      toolbarAdaptive: false,
      showCharsCounter: false,
      showWordsCounter: false,
      showXPathInStatusbar: false,
    }),
    [],
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shouldFocus = params.get('reply') === '1' || window.location.hash === '#reply';
    if (!shouldFocus) return;
    const el = replyContainerRef.current;
    if (!el) return;
    el.scrollIntoView({ block: 'center' });
  }, []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    post(route('tickets.comment', ticket.id), {
      preserveScroll: true,
      forceFormData: true,
      showProgress: false,
      onSuccess: () => {
        reset('body');
        playSuccessSound();
      },
    });
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={route('tickets.index', { view_mode: 'client' })}
              className="inline-flex items-center justify-center rounded-md bg-slate-100 p-2 text-slate-700 hover:bg-slate-200"
              preserveState
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
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </Link>
            <div>
            <div className="text-sm text-slate-500">{ticket.project?.name ?? '-'}</div>
            <div className="text-lg font-semibold text-slate-900">{ticket.title}</div>
            <div className="mt-1 text-xs text-slate-500">
              #{ticket.code} • {new Date(ticket.created_at).toLocaleString('id-ID')}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold">
              {ticket.category && (
                <span className={`rounded px-3 py-1.5 text-xs font-semibold text-white ${
                    ticket.category === 'IT' 
                        ? 'bg-blue-500' 
                        : 'bg-amber-500'
                }`}>
                  Unit Tujuan: {ticket.category}
                </span>
              )}
              {ticket.type && (
                <span className="rounded bg-slate-100 px-2 py-1 text-slate-700">
                  {ticket.type}
                </span>
              )}
              <span className={`rounded px-2 py-1 ${priorityBadgeClass(ticket.priority)}`}>
                {priorityLabel(ticket.priority)}
              </span>
            </div>
          </div>
          </div>
          <div className="flex items-center gap-2">
            {ticket.type && (
              <div className="rounded bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                {ticket.type}
              </div>
            )}
            <div className={`rounded px-3 py-1.5 text-xs font-semibold ${statusBadgeClass(ticket.status)}`}>
              {statusLabel(ticket.status)}
            </div>
          </div>
        </div>
      }
    >
      <Head title={`Ticket ${ticket.code}`} />

      <div className="mx-auto max-w-5xl p-6">
        {canEdit && (
          <div className="rounded-lg border border-slate-200 bg-white mb-6">
            <div className="border-b px-6 py-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Kelola Ticket</div>
            </div>
            <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Status</label>
                <select
                  value={data.status}
                  onChange={(e) => {
                    const newStatus = e.target.value as TicketStatus;
                    setData('status', newStatus);
                    router.patch(route('tickets.status', ticket.id), { 
                      status: newStatus, 
                      priority: data.priority, 
                      type: data.type 
                    }, {
                      preserveScroll: true,
                      showProgress: false
                    });
                  }}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="pending">Pending</option>
                  <option value="resolved">Review</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Prioritas</label>
                <select
                  value={data.priority}
                  onChange={(e) => {
                    const newPriority = e.target.value as Ticket['priority'];
                    setData('priority', newPriority);
                    router.patch(route('tickets.status', ticket.id), { 
                      status: data.status, 
                      priority: newPriority, 
                      type: data.type 
                    }, {
                      preserveScroll: true,
                      showProgress: false
                    });
                  }}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                >
                  <option value="low">Rendah</option>
                  <option value="medium">Sedang</option>
                  <option value="high">Tinggi</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Type</label>
                <select
                  value={data.type ?? ''}
                  onChange={(e) => {
                    const newType = e.target.value || null;
                    setData('type', newType);
                    router.patch(route('tickets.status', ticket.id), { 
                      status: data.status, 
                      priority: data.priority, 
                      type: newType 
                    }, {
                      preserveScroll: true,
                      showProgress: false
                    });
                  }}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                >
                  <option value="">Pilih Type</option>
                  <option value="Request">Permintaan</option>
                  <option value="Incident">Insiden</option>
                  <option value="Bug">Bugs/Error</option>
                  <option value="Maintenance">Perbiakan</option>
                  <option value="Other">Lain-lain</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Assignee</label>
                <select
                  value={data.assignee_id ?? ''}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : null;
                    setData('assignee_id', val);
                    if (val) {
                      router.post(route('tickets.assign', ticket.id), { assignee_id: val }, {
                        preserveScroll: true,
                        showProgress: false
                      });
                    }
                  }}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                >
                  <option value="">Pilih Assignee</option>
                  {availableAssignees.map((user) => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b px-6 py-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Detail</div>
          </div>
          <div className="px-6 py-5">
            <div
              className="text-sm text-slate-700"
              dangerouslySetInnerHTML={{ __html: ticket.description ?? '<p>Tidak ada deskripsi.</p>' }}
            />
            {ticket.assignee && (
              <div className="mt-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Assignee
                </div>
                <div className="mt-2 text-sm font-semibold text-slate-800">
                  {ticket.assignee.name}
                </div>
              </div>
            )}
            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Attachment
              </div>
              {attachments.length === 0 ? (
                <div className="mt-2 text-sm text-slate-500">Tidak ada attachment.</div>
              ) : (
                <div className="mt-2 space-y-2">
                  {attachments.map((a, idx) => (
                    <a
                      key={`${idx}-${a.path}`}
                      href={route('tickets.attachments.download', { ticket: ticket.id, index: idx })}
                      className="block rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {a.original_name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-slate-200 bg-white">
          <div className="border-b px-6 py-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Diskusi</div>
          </div>
          <div className="divide-y">
            {comments.map((c) => (
              <div
                key={c.id}
                className="px-6 py-4 flex"
              >
                <div
                  className={[
                    'w-fit max-w-3xl rounded-lg border px-4 py-3',
                    currentUserId != null && c.user.id === currentUserId ? 'ml-auto bg-sky-100 border-sky-200' : 'mr-auto',
                    currentUserId != null && c.user.id === currentUserId
                      ? ''
                      : otherUserStyles[((c.user.id ?? 0) % otherUserStyles.length + otherUserStyles.length) % otherUserStyles.length],
                  ].join(' ')}
                >
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                    <div className="inline-flex items-center gap-2">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/70 text-[11px] font-bold text-slate-700 ring-1 ring-black/5">
                        {c.user.name?.slice(0, 1).toUpperCase()}
                      </span>
                      <span className="font-semibold text-slate-700">{c.user.name}</span>
                    </div>
                    <div className="inline-flex items-center gap-1">
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
                          d="M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z"
                        />
                      </svg>
                      <span>{formatDateLabel(c.created_at)}</span>
                    </div>
                    <div className="inline-flex items-center gap-1">
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
                          d="M12 6v6l4 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>{formatRelativeTime(c.created_at)}</span>
                    </div>
                  </div>
                  <div
                    className="mt-2 text-sm text-slate-800 [&_p]:my-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                    dangerouslySetInnerHTML={{ __html: c.body }}
                  />
                  {normalizeAttachments(c.attachments).length > 0 && (
                    <div className="mt-3 space-y-2">
                      {normalizeAttachments(c.attachments).map((a, idx) => (
                        <a
                          key={`${idx}-${a.path}`}
                          href={route('tickets.comments.attachments.download', {
                            ticket: ticket.id,
                            comment: c.id,
                            index: idx,
                          })}
                          className="block rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {a.original_name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {comments.length === 0 && <div className="px-6 py-6 text-sm text-slate-500">Belum ada komentar.</div>}
          </div>

          <form onSubmit={submit} className="border-t px-6 py-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tulis Balasan</div>
            <div
              ref={replyContainerRef}
              className="mt-2 overflow-hidden rounded-md border border-slate-300 shadow-sm focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-400"
            >
              <JoditEditor
                value={data.body}
                config={editorConfig}
                onBlur={(value) => setData('body', value)}
                onChange={(value) => setData('body', value)}
              />
            </div>
            <div className="mt-4 rounded-md border border-slate-200 bg-white px-3 py-3">
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.gif,.doc,.docx,.pdf,.xlsx,.csv,.xls"
                  onChange={(e) => {
                    const files = Array.from(e.target.files ?? []);
                    setData('attachments', files);
                  }}
                  className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
                />
              </div>
              <div className="mt-2 text-xs text-slate-500">
                Only jpg, jpeg, png, gif, doc, docx, pdf, xlsx, csv, xls is allowed
              </div>

              {data.attachments.length > 0 && (
                <div className="mt-3 border-t border-slate-100 pt-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Selected File
                  </div>
                  <div className="mt-2 space-y-1 text-sm text-slate-700">
                    {data.attachments.map((f) => (
                      <div key={`${f.name}-${f.size}`} className="truncate">
                        {f.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-3 flex items-center justify-start">
              <button
                type="submit"
                disabled={processing || isEditorEmpty}
                className="rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-60"
              >
                Save Reply
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6">
          <Link
            href={route('tickets.index', { view_mode: 'client' })}
            className="text-sm font-semibold text-slate-700 hover:text-slate-900"
            preserveState
          >
            ← Kembali ke daftar tiket
          </Link>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
