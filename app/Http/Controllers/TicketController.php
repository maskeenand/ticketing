<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTicketRequest;
use App\Models\Project;
use App\Models\Ticket;
use App\Models\TicketComment;
use App\Models\User;
use App\Notifications\TicketCommented;
use App\Notifications\TicketCreated;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class TicketController extends Controller
{
    public function index(Request $request)
    {
        $tabParam = $request->string('tab')->toString();
        $tab = in_array($tabParam, ['list', 'chart', 'overview'], true) ? $tabParam : 'list';

        $categoryParam = $request->string('category')->toString();
        $categoryFilter = in_array($categoryParam, ['IT', 'IPSRS'], true) ? $categoryParam : null;

        $viewMode = $request->string('view_mode')->toString();
        $filters = [
            'tab' => $tab,
            'view' => $request->string('view')->toString() ?: 'table',
            'status' => $request->string('status')->toString() ?: null,
            'period_start' => $request->string('period_start')->toString() ?: null,
            'period_end' => $request->string('period_end')->toString() ?: null,
            'q' => $request->string('q')->toString() ?: null,
            'category' => $categoryFilter,
            'project_id' => $request->integer('project_id') ?: null,
            'created_by' => $request->integer('created_by') ?: null,
            'raised_by' => $request->integer('raised_by') ?: null,
            'view_mode' => $viewMode,
        ];

        $user = $request->user();
        $staffTeam = $this->getStaffTeam($user);
        $isUnitAdmin = $user !== null && $user->role === 'admin';
        $isSupervisor = $user !== null && $user->role === 'supervisor';

        if ($viewMode === '') {
            $viewMode = ($staffTeam || $isUnitAdmin || $isSupervisor) ? 'client' : 'personal';
            $filters['view_mode'] = $viewMode;
        }

        $effectiveStaffTeam = $viewMode === 'client' ? $staffTeam : null;
        $effectiveIsUnitAdmin = $viewMode === 'client' ? $isUnitAdmin : false;

        if ($effectiveStaffTeam || $effectiveIsUnitAdmin || ($isSupervisor && $viewMode === 'client')) {
            $tab = 'list';
            $filters['tab'] = $tab;
        }

        $queryWithoutStatus = Ticket::query()
            ->with(['project:id,name', 'requester:id,name', 'creator:id,name', 'assignee:id,name', 'latestComment.user:id,name'])
            ->orderByDesc('created_at');

        if (! $effectiveStaffTeam && ! $effectiveIsUnitAdmin && ! ($isSupervisor && $viewMode === 'client')) {
            if ($user !== null && $user->unit_id) {
                $filters['project_id'] = (int) $user->unit_id;
                $filters['raised_by'] = null;
            } elseif ($user !== null) {
                $filters['raised_by'] = $user->id;
            }
        }

        $statusCountsQuery = Ticket::query();
        $this->applyFilters($statusCountsQuery, $filters, false, $effectiveStaffTeam, $user);
        $statusCounts = $statusCountsQuery
            ->selectRaw('status, COUNT(*) as aggregate')
            ->groupBy('status')
            ->pluck('aggregate', 'status');

        $query = Ticket::query()
            ->with(['project:id,name', 'requester:id,name', 'creator:id,name', 'assignee:id,name', 'latestComment.user:id,name'])
            ->withCount('comments')
            ->orderByDesc('created_at');

        $this->applyFilters($query, $filters, true, $effectiveStaffTeam, $user);

        $tickets = $query
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Ticket $ticket) => [
                'id' => $ticket->id,
                'code' => $ticket->code,
                'title' => $ticket->title,
                'description' => $ticket->description,
                'status' => $ticket->status,
                'priority' => $ticket->priority,
                'created_at' => $ticket->created_at?->toISOString(),
                'project' => $ticket->project ? ['id' => $ticket->project->id, 'name' => $ticket->project->name] : null,
                'requester' => $ticket->requester ? ['id' => $ticket->requester->id, 'name' => $ticket->requester->name] : null,
                'creator' => $ticket->creator ? ['id' => $ticket->creator->id, 'name' => $ticket->creator->name] : null,
                'assignee' => $ticket->assignee ? ['id' => $ticket->assignee->id, 'name' => $ticket->assignee->name] : null,
                'category' => $ticket->category,
                'type' => $ticket->type,
                'last_replied_by' => $ticket->latestComment?->user?->name,
                'last_replied_at' => $ticket->latestComment?->created_at?->toISOString(),
                'feedback_rating' => $ticket->feedback_rating,
                'attachments_count' => is_array($ticket->attachments) ? count($ticket->attachments) : 0,
                'comments_count' => (int) ($ticket->comments_count ?? 0),
            ]);

        $creatorIds = (clone $queryWithoutStatus)->reorder()->distinct()->pluck('creator_id')->filter()->values();
        $requesterIds = (clone $queryWithoutStatus)->reorder()->distinct()->pluck('requester_id')->filter()->values();

        $createdByUsers = User::query()
            ->whereIn('id', $creatorIds)
            ->orderBy('name')
            ->limit(200)
            ->get(['id', 'name']);

        $raisedByUsers = User::query()
            ->whereIn('id', $requesterIds)
            ->orderBy('name')
            ->limit(200)
            ->get(['id', 'name']);

        $chart = [
            'categories' => [],
            'series' => [
                ['name' => 'Tiket dibuat', 'data' => []],
                ['name' => 'Tiket ditutup', 'data' => []],
            ],
        ];

        if (! $effectiveStaffTeam && ! $effectiveIsUnitAdmin) {
            $rangeStart = $filters['period_start'] ? Carbon::parse($filters['period_start'])->startOfDay() : now()->subDays(29)->startOfDay();
            $rangeEnd = $filters['period_end'] ? Carbon::parse($filters['period_end'])->endOfDay() : now()->endOfDay();
            if ($rangeStart->greaterThan($rangeEnd)) {
                [$rangeStart, $rangeEnd] = [$rangeEnd->copy()->startOfDay(), $rangeStart->copy()->endOfDay()];
            }

            $maxDays = 90;
            $rangeDays = $rangeStart->diffInDays($rangeEnd) + 1;
            if ($rangeDays > $maxDays) {
                $rangeStart = $rangeEnd->copy()->subDays($maxDays - 1)->startOfDay();
            }

            $filtersNoPeriod = $filters;
            $filtersNoPeriod['period_start'] = null;
            $filtersNoPeriod['period_end'] = null;

            $createdQuery = Ticket::query();
            $this->applyFilters($createdQuery, $filtersNoPeriod, false, $effectiveStaffTeam, $user);
            $createdMap = $createdQuery
                ->whereBetween('created_at', [$rangeStart, $rangeEnd])
                ->selectRaw('DATE(created_at) as day, COUNT(*) as aggregate')
                ->groupBy('day')
                ->orderBy('day')
                ->pluck('aggregate', 'day');

            $closedQuery = Ticket::query();
            $this->applyFilters($closedQuery, $filtersNoPeriod, false, $effectiveStaffTeam, $user);
            $closedMap = $closedQuery
                ->whereRaw('COALESCE(closed_at, resolved_at) IS NOT NULL')
                ->whereRaw('COALESCE(closed_at, resolved_at) BETWEEN ? AND ?', [$rangeStart, $rangeEnd])
                ->selectRaw('DATE(COALESCE(closed_at, resolved_at)) as day, COUNT(*) as aggregate')
                ->groupBy('day')
                ->orderBy('day')
                ->pluck('aggregate', 'day');

            $categories = [];
            $createdSeries = [];
            $closedSeries = [];
            $cursor = $rangeStart->copy()->startOfDay();
            $endDay = $rangeEnd->copy()->startOfDay();
            while ($cursor->lessThanOrEqualTo($endDay)) {
                $day = $cursor->toDateString();
                $categories[] = $day;
                $createdSeries[] = (int) ($createdMap[$day] ?? 0);
                $closedSeries[] = 0 - (int) ($closedMap[$day] ?? 0);
                $cursor->addDay();
            }

            $chart = [
                'categories' => $categories,
                'series' => [
                    ['name' => 'Tiket dibuat', 'data' => $createdSeries],
                    ['name' => 'Tiket ditutup', 'data' => $closedSeries],
                ],
            ];
        }

        $canEdit = $staffTeam || $isUnitAdmin || $isSupervisor;
        $availableAssignees = collect();
        if ($canEdit) {
            if ($staffTeam) {
                $availableAssignees = User::query()
                    ->where(function ($q) use ($staffTeam) {
                        if ($staffTeam === 'IT') {
                            $q->where('role', 'it')->orWhere('team', 'IT');
                        } elseif ($staffTeam === 'IPSRS') {
                            $q->where('role', 'ipsrs')->orWhere('team', 'IPSRS');
                        }
                    })
                    ->where('is_active', true)
                    ->orderBy('name')
                    ->get(['id', 'name']);
            } elseif ($isSupervisor) {
                // Supervisor bisa memilih dari anggota timnya dan subordinatesnya
                $supervisorTeam = $this->getStaffTeam($user);
                $availableAssignees = User::query()
                    ->where(function ($q) use ($supervisorTeam, $user) {
                        if ($supervisorTeam) {
                            if ($supervisorTeam === 'IT') {
                                $q->orWhere('role', 'it')->orWhere('team', 'IT');
                            } elseif ($supervisorTeam === 'IPSRS') {
                                $q->orWhere('role', 'ipsrs')->orWhere('team', 'IPSRS');
                            }
                        }
                        // Tambahkan subordinates dari supervisor
                        $subordinateIds = $user->subordinates()->pluck('id')->toArray();
                        if (!empty($subordinateIds)) {
                            $q->orWhereIn('id', $subordinateIds);
                        }
                    })
                    ->where('is_active', true)
                    ->orderBy('name')
                    ->get(['id', 'name']);
            }
        }

        return Inertia::render('Tickets/Index', [
            'filters' => $filters,
            'tickets' => $tickets,
            'statusCounts' => [
                'open' => (int) ($statusCounts['open'] ?? 0),
                'in_progress' => (int) ($statusCounts['in_progress'] ?? 0),
                'pending' => (int) ($statusCounts['pending'] ?? 0),
                'resolved' => (int) ($statusCounts['resolved'] ?? 0),
                'closed' => (int) ($statusCounts['closed'] ?? 0),
            ],
            'chart' => $chart,
            'projects' => $staffTeam
                ? Project::query()->orderBy('name')->get(['id', 'name'])
                : ($isUnitAdmin
                    ? Project::query()->orderBy('name')->get(['id', 'name'])
                    : ($user !== null && $user->unit_id
                        ? Project::query()->whereKey($user->unit_id)->get(['id', 'name'])
                        : Project::query()->orderBy('name')->get(['id', 'name']))),
            'createdByUsers' => $createdByUsers,
            'raisedByUsers' => $raisedByUsers,
            'canEdit' => $canEdit,
            'availableAssignees' => $availableAssignees,
        ]);
    }

    public function create()
    {
        $user = request()->user();

        return Inertia::render('Tickets/Create', [
            'projects' => $user !== null && $user->role === 'admin'
                ? Project::query()->orderBy('name')->get(['id', 'name', 'priorities', 'types'])
                : ($user !== null && $user->unit_id
                ? Project::query()->whereKey($user->unit_id)->get(['id', 'name', 'priorities', 'types'])
                : Project::query()->orderBy('name')->get(['id', 'name', 'priorities', 'types'])),
        ]);
    }

    public function store(StoreTicketRequest $request)
    {
        $validated = $request->validated();
        $user = $request->user();

        $ticket = DB::transaction(function () use ($validated, $user) {
            for ($i = 0; $i < 10; $i++) {
                $code = $this->generateTicketCode((string) ($validated['category'] ?? ''));
                try {
                    return Ticket::create([
                        'code' => $code,
                        'project_id' => $validated['project_id'] ?? null,
                        'requester_id' => $user->id,
                        'creator_id' => $user->id,
                        'assignee_id' => null,
                        'title' => $validated['title'],
                        'description' => $validated['description'] ?? null,
                        'category' => $validated['category'],
                        'type' => $validated['type'] ?? null,
                        'attachments' => null,
                        'status' => 'open',
                        'priority' => $validated['priority'] ?? 'medium',
                        'closed_at' => null,
                        'resolved_at' => null,
                        'feedback_rating' => null,
                        'feedback_comment' => null,
                    ]);
                } catch (QueryException $e) {
                    $message = (string) $e->getMessage();
                    if (str_contains($message, 'UNIQUE') || str_contains($message, 'unique')) {
                        continue;
                    }
                    throw $e;
                }
            }

            throw ValidationException::withMessages([
                'code' => 'Gagal membuat kode ticket.',
            ]);
        });

        $attachments = [];
        /** @var array<int, UploadedFile> $uploadedFiles */
        $uploadedFiles = $request->file('attachments', []);
        
        if ($uploadedFiles) {
            // Ensure ticket directory has correct permissions
            $ticketDir = storage_path("app/private/tickets/{$ticket->id}");
            if (! is_dir($ticketDir)) {
                @mkdir($ticketDir, 0775, true);
            }
            @chmod($ticketDir, 0775);
        }
        
        foreach ($uploadedFiles as $file) {
            $extension = $file->getClientOriginalExtension();
            $safeExtension = $extension ? ('.' . strtolower($extension)) : '';
            $fileName = Str::lower(Str::random(16)) . $safeExtension;

            $path = $file->storeAs("tickets/{$ticket->id}", $fileName);
            if ($path) {
                // Ensure file has correct permissions
                $filePath = storage_path("app/private/{$path}");
                @chmod($filePath, 0664);
            }
            $attachments[] = [
                'path' => $path,
                'original_name' => $file->getClientOriginalName(),
                'mime' => $file->getClientMimeType(),
                'size' => $file->getSize(),
            ];
        }

        if ($attachments !== []) {
            $ticket->update([
                'attachments' => $attachments,
            ]);
        }

        $ticket->loadMissing(['project:id,name']);

        $recipientIds = collect([$ticket->requester_id])->filter()->map(fn ($id) => (int) $id);

        $adminUnitUsers = User::query()->where('role', 'admin')->pluck('id');
        $recipientIds = $recipientIds->merge($adminUnitUsers);

        // Add users in the target category (unit tujuan)
        if ($ticket->category) {
            $targetCategory = $ticket->category;
            $teamUsers = User::query()
                ->where('is_active', true)
                ->where(function ($query) use ($targetCategory) {
                    $lowerCategory = strtolower($targetCategory);
                    $query->where('role', $lowerCategory)
                          ->orWhere('team', $targetCategory);
                })
                ->pluck('id');
            $recipientIds = $recipientIds->merge($teamUsers);
            
            // Debug: Log penerima notifikasi
            \Log::info('Notification recipients for ticket ' . $ticket->code, [
                'category' => $targetCategory,
                'team_user_ids' => $teamUsers->toArray(),
                'all_recipient_ids' => $recipientIds->toArray()
            ]);
        }

        $recipientIds = $recipientIds->unique()->values();

        if ($recipientIds->isNotEmpty()) {
            $recipients = User::query()->whereIn('id', $recipientIds)->get();
            // Send notifications after response to make it feel faster
            dispatch(function () use ($recipients, $ticket, $user) {
                Notification::send($recipients, new TicketCreated($ticket, $user));
            })->afterResponse();
        }

        return redirect()
            ->route('tickets.index', ['view_mode' => 'client'])
            ->with('success', "Ticket {$ticket->code} berhasil dibuat.");
    }

    public function claim(Request $request, Ticket $ticket)
    {
        $user = $request->user();
        $staffTeam = $this->getStaffTeam($user);

        if ($user === null || ! $staffTeam) {
            abort(403);
        }

        if ($ticket->assignee_id !== null) {
            return back()->with('error', 'Ticket sudah di-assign.');
        }

        if ($ticket->category !== $staffTeam) {
            abort(403);
        }

        $ticket->update([
            'assignee_id' => $user->id,
            'status' => $ticket->status === 'open' ? 'in_progress' : $ticket->status,
        ]);

        return back()->with('success', "Ticket {$ticket->code} berhasil di-claim.");
    }

    public function assign(Request $request, Ticket $ticket)
    {
        $validated = $request->validate([
            'assignee_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $user = $request->user();
        $staffTeam = $this->getStaffTeam($user);
        $isUnitAdmin = $user !== null && $user->role === 'admin';
        $isSupervisor = $user !== null && $user->role === 'supervisor';

        if ($user === null || (!$staffTeam && !$isUnitAdmin && !$isSupervisor)) {
            abort(403);
        }

        // Admin bisa assign ke semua tim, tapi staff dan supervisor terbatas ke timnya sendiri
        if (!$isUnitAdmin && $ticket->category !== $staffTeam) {
            // Cek apakah supervisor memiliki tim yang sesuai
            if ($isSupervisor) {
                $supervisorTeam = $this->getStaffTeam($user);
                if (!$supervisorTeam || $ticket->category !== $supervisorTeam) {
                    abort(403);
                }
            } else {
                abort(403);
            }
        }

        $assignee = User::findOrFail($validated['assignee_id']);
        $assigneeTeam = $this->getStaffTeam($assignee);

        // Pastikan assignee berada di tim yang sesuai dengan ticket
        if ($ticket->category === 'IT') {
            if ($assigneeTeam !== 'IT' && !($isSupervisor && in_array($assignee->id, $user->subordinates()->pluck('id')->toArray()))) {
                abort(403, 'User tidak berada di tim yang sesuai.');
            }
        } elseif ($ticket->category === 'IPSRS') {
            if ($assigneeTeam !== 'IPSRS' && !($isSupervisor && in_array($assignee->id, $user->subordinates()->pluck('id')->toArray()))) {
                abort(403, 'User tidak berada di tim yang sesuai.');
            }
        }

        $ticket->update([
            'assignee_id' => $assignee->id,
        ]);

        return back()->with('success', "Ticket {$ticket->code} berhasil di-assign ke {$assignee->name}.");
    }

    public function updateStatus(Request $request, Ticket $ticket)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:open,in_progress,pending,resolved,closed'],
            'priority' => ['nullable', 'string'],
            'type' => ['nullable', 'string'],
        ]);

        $user = $request->user();
        if ($user === null) {
            abort(403);
        }

        $nextStatus = $validated['status'];
        $priority = $validated['priority'] ?? null;
        $type = $validated['type'] ?? null;

        $staffTeam = $this->getStaffTeam($user);
        $isUnitAdmin = $user->role === 'admin';
        $isSupervisor = $user->role === 'supervisor';

        if ($staffTeam || $isUnitAdmin || $isSupervisor) {
            if ($staffTeam && $ticket->category !== $staffTeam) {
                abort(403);
            }

            if (! $isUnitAdmin && ! $isSupervisor) {
                if ($ticket->assignee_id !== null && (int) $ticket->assignee_id !== (int) $user->id) {
                    abort(403);
                }
            }

            DB::transaction(function () use ($ticket, $nextStatus, $user, $staffTeam, $priority, $type) {
                $updates = ['status' => $nextStatus];
                
                if ($priority !== null) {
                    $updates['priority'] = $priority;
                }
                if ($type !== null) {
                    $updates['type'] = $type;
                }

                if ($staffTeam && $ticket->assignee_id === null && $nextStatus !== 'open') {
                    $updates['assignee_id'] = $user->id;
                }

                if (($nextStatus === 'resolved' || $nextStatus === 'closed') && $ticket->resolved_at === null) {
                    $updates['resolved_at'] = now();
                }
                if ($nextStatus === 'closed' && $ticket->closed_at === null) {
                    $updates['closed_at'] = now();
                }

                $ticket->update($updates);
            });

            return back()->with('success', "Ticket {$ticket->code} diupdate.");
        }

        if ($nextStatus === 'closed') {
            if ((int) $ticket->requester_id !== (int) $user->id) {
                abort(403);
            }
            if (! in_array($ticket->status, ['resolved', 'closed'], true)) {
                return back()->with('error', 'Ticket harus resolved sebelum closed.');
            }
        } else {
            if ((int) $ticket->assignee_id !== (int) $user->id) {
                abort(403);
            }
        }

        DB::transaction(function () use ($ticket, $nextStatus, $priority, $type) {
            $updates = ['status' => $nextStatus];
            
            if ($priority !== null) {
                $updates['priority'] = $priority;
            }
            if ($type !== null) {
                $updates['type'] = $type;
            }

            if ($nextStatus === 'resolved' && $ticket->resolved_at === null) {
                $updates['resolved_at'] = now();
            }
            if ($nextStatus === 'closed' && $ticket->closed_at === null) {
                $updates['closed_at'] = now();
            }

            $ticket->update($updates);
        });

        return back()->with('success', "Ticket {$ticket->code} diupdate.");
    }

    public function feedback(Request $request, Ticket $ticket)
    {
        $validated = $request->validate([
            'rating' => ['nullable', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:2000'],
        ]);

        $user = $request->user();
        if ($user === null || (int) $ticket->requester_id !== (int) $user->id) {
            abort(403);
        }

        $ticket->update([
            'feedback_rating' => $validated['rating'] ?? null,
            'feedback_comment' => $validated['comment'] ?? null,
        ]);

        return back()->with('success', "Feedback untuk {$ticket->code} tersimpan.");
    }

    public function show(Request $request, Ticket $ticket)
    {
        $user = $request->user();
        if ($user === null) {
            abort(403);
        }

        $this->ensureCanViewTicket($user, $ticket);

        $ticket->load(['project:id,name', 'requester:id,name', 'creator:id,name', 'assignee:id,name', 'comments' => function ($q) {
            $q->with('user:id,name')->orderBy('created_at');
        }]);

        $staffTeam = $this->getStaffTeam($user);
        $isSupervisor = $user->role === 'supervisor';
        $canEdit = $staffTeam || $user->role === 'admin' || $isSupervisor;

        $availableAssignees = collect();
        if ($canEdit) {
            if ($ticket->category) {
                $availableAssignees = User::query()
                    ->where(function ($q) use ($ticket, $isSupervisor, $user) {
                        if ($ticket->category === 'IT') {
                            $q->orWhere('role', 'it')->orWhere('team', 'IT');
                        } elseif ($ticket->category === 'IPSRS') {
                            $q->orWhere('role', 'ipsrs')->orWhere('team', 'IPSRS');
                        }
                        // Jika supervisor, tambahkan subordinatesnya
                        if ($isSupervisor) {
                            $subordinateIds = $user->subordinates()->pluck('id')->toArray();
                            if (!empty($subordinateIds)) {
                                $q->orWhereIn('id', $subordinateIds);
                            }
                        }
                    })
                    ->where('is_active', true)
                    ->orderBy('name')
                    ->get(['id', 'name']);
            }
        }

        return Inertia::render('Tickets/Show', [
            'ticket' => [
                'id' => $ticket->id,
                'code' => $ticket->code,
                'title' => $ticket->title,
                'description' => $ticket->description,
                'status' => $ticket->status,
                'priority' => $ticket->priority,
                'category' => $ticket->category,
                'created_at' => $ticket->created_at?->toISOString(),
                'project' => $ticket->project ? ['id' => $ticket->project->id, 'name' => $ticket->project->name] : null,
                'requester' => $ticket->requester ? ['id' => $ticket->requester->id, 'name' => $ticket->requester->name] : null,
                'creator' => $ticket->creator ? ['id' => $ticket->creator->id, 'name' => $ticket->creator->name] : null,
                'assignee' => $ticket->assignee ? ['id' => $ticket->assignee->id, 'name' => $ticket->assignee->name] : null,
                'attachments' => $ticket->attachments,
            ],
            'comments' => $ticket->comments->map(fn ($c) => [
                'id' => $c->id,
                'user' => ['id' => $c->user->id, 'name' => $c->user->name],
                'body' => $c->body,
                'attachments' => $c->attachments,
                'created_at' => $c->created_at?->toISOString(),
            ]),
            'canEdit' => $canEdit,
            'availableAssignees' => $availableAssignees,
        ]);
    }

    public function downloadAttachment(Request $request, Ticket $ticket, int $index)
    {
        $user = $request->user();
        if ($user === null) {
            abort(403);
        }

        $this->ensureCanViewTicket($user, $ticket);

        $attachments = $ticket->attachments;
        if (! is_array($attachments) || ! array_key_exists($index, $attachments)) {
            abort(404);
        }

        $attachment = $attachments[$index];
        if (! is_array($attachment)) {
            abort(404);
        }

        $path = $attachment['path'] ?? null;
        if (! is_string($path) || $path === '') {
            abort(404);
        }

        if (! str_starts_with($path, "tickets/{$ticket->id}/")) {
            abort(404);
        }

        $disk = (string) config('filesystems.default', 'local');
        if (! Storage::disk($disk)->exists($path)) {
            abort(404);
        }

        $originalName = $attachment['original_name'] ?? null;
        $fileName = is_string($originalName) && $originalName !== '' ? $originalName : basename($path);

        $mime = $attachment['mime'] ?? null;
        if (! is_string($mime) || $mime === '') {
            $guessed = File::mimeType(Storage::disk($disk)->path($path));
            $mime = is_string($guessed) && $guessed !== '' ? $guessed : null;
        }

        $safeFileName = str_replace('"', '', $fileName);

        return response()->file(Storage::disk($disk)->path($path), array_filter([
            'Content-Type' => $mime,
            'Content-Disposition' => 'inline; filename="' . $safeFileName . '"',
        ]));
    }

    public function downloadCommentAttachment(Request $request, Ticket $ticket, TicketComment $comment, int $index)
    {
        $user = $request->user();
        if ($user === null) {
            abort(403);
        }

        $this->ensureCanViewTicket($user, $ticket);

        if ((int) $comment->ticket_id !== (int) $ticket->id) {
            abort(404);
        }

        $attachments = $comment->attachments;
        if (! is_array($attachments) || ! array_key_exists($index, $attachments)) {
            abort(404);
        }

        $attachment = $attachments[$index];
        if (! is_array($attachment)) {
            abort(404);
        }

        $path = $attachment['path'] ?? null;
        if (! is_string($path) || $path === '') {
            abort(404);
        }

        if (! str_starts_with($path, "tickets/{$ticket->id}/comments/")) {
            abort(404);
        }

        $disk = (string) config('filesystems.default', 'local');
        if (! Storage::disk($disk)->exists($path)) {
            abort(404);
        }

        $originalName = $attachment['original_name'] ?? null;
        $fileName = is_string($originalName) && $originalName !== '' ? $originalName : basename($path);

        $mime = $attachment['mime'] ?? null;
        if (! is_string($mime) || $mime === '') {
            $guessed = File::mimeType(Storage::disk($disk)->path($path));
            $mime = is_string($guessed) && $guessed !== '' ? $guessed : null;
        }

        $safeFileName = str_replace('"', '', $fileName);

        return response()->file(Storage::disk($disk)->path($path), array_filter([
            'Content-Type' => $mime,
            'Content-Disposition' => 'inline; filename="' . $safeFileName . '"',
        ]));
    }

    public function comment(Request $request, Ticket $ticket)
    {
        $validated = $request->validate([
            'body' => ['required', 'string', 'max:5000'],
            'attachments' => ['nullable', 'array', 'max:5'],
            'attachments.*' => [
                'file',
                'max:5120',
                'mimes:jpg,jpeg,png,gif,doc,docx,pdf,xls,xlsx,csv',
            ],
        ]);

        $user = $request->user();
        if ($user === null) {
            abort(403);
        }

        $body = $this->sanitizeCommentBody($validated['body']);
        if (trim(strip_tags($body)) === '') {
            throw ValidationException::withMessages([
                'body' => 'Komentar wajib diisi.',
            ]);
        }

        $attachments = [];
        /** @var array<int, UploadedFile> $uploadedFiles */
        $uploadedFiles = $request->file('attachments', []);
        
        if ($uploadedFiles) {
            // Ensure comment directory has correct permissions
            $commentsDir = storage_path("app/private/tickets/{$ticket->id}/comments");
            if (! is_dir($commentsDir)) {
                @mkdir($commentsDir, 0775, true);
            }
            @chmod($commentsDir, 0775);
        }
        
        foreach ($uploadedFiles as $file) {
            $extension = $file->getClientOriginalExtension();
            $safeExtension = $extension ? ('.' . strtolower($extension)) : '';
            $fileName = Str::lower(Str::random(16)) . $safeExtension;

            $path = $file->storeAs("tickets/{$ticket->id}/comments", $fileName);
            if ($path) {
                // Ensure file has correct permissions
                $filePath = storage_path("app/private/{$path}");
                @chmod($filePath, 0664);
            }
            $attachments[] = [
                'path' => $path,
                'original_name' => $file->getClientOriginalName(),
                'mime' => $file->getClientMimeType(),
                'size' => $file->getSize(),
            ];
        }

        $comment = $ticket->comments()->create([
            'user_id' => $user->id,
            'body' => $body,
            'attachments' => $attachments !== [] ? $attachments : null,
        ]);

        $recipientIds = collect([$ticket->requester_id, $ticket->creator_id, $ticket->assignee_id])
            ->filter()
            ->map(fn ($id) => (int) $id);

        $recipientIds = $recipientIds
            ->unique()
            ->reject(fn ($id) => (int) $id === (int) $user->id)
            ->values();

        if ($recipientIds->isNotEmpty()) {
            $recipients = User::query()->whereIn('id', $recipientIds)->get();
            Notification::send($recipients, new TicketCommented($ticket, $comment, $user));
        }

        return back()->with('success', 'Komentar tersimpan.');
    }

    private function sanitizeCommentBody(string $html): string
    {
        $clean = strip_tags($html, '<b><strong><i><em><u><p><br><div><ul><ol><li>');
        $clean = preg_replace('/\son\w+\s*=\s*(\"[^\"]*\"|\'[^\']*\'|[^\s>]+)/i', '', $clean) ?? $clean;
        $clean = preg_replace('/\sstyle\s*=\s*(\"[^\"]*\"|\'[^\']*\')/i', '', $clean) ?? $clean;
        $clean = preg_replace('/\shref\s*=\s*(\"javascript:[^\"]*\"|\'javascript:[^\']*\')/i', '', $clean) ?? $clean;

        return $clean;
    }

    public function export(Request $request)
    {
        $categoryParam = $request->string('category')->toString();
        $categoryFilter = in_array($categoryParam, ['IT', 'IPSRS'], true) ? $categoryParam : null;

        $filters = [
            'status' => $request->string('status')->toString() ?: null,
            'period_start' => $request->string('period_start')->toString() ?: null,
            'period_end' => $request->string('period_end')->toString() ?: null,
            'q' => $request->string('q')->toString() ?: null,
            'category' => $categoryFilter,
            'project_id' => $request->integer('project_id') ?: null,
            'created_by' => $request->integer('created_by') ?: null,
            'raised_by' => $request->integer('raised_by') ?: null,
        ];

        $user = $request->user();
        $staffTeam = $this->getStaffTeam($user);

        if (! $staffTeam && ! ($user !== null && $user->role === 'admin')) {
            if ($user !== null && $user->unit_id) {
                $filters['project_id'] = (int) $user->unit_id;
                $filters['raised_by'] = null;
            } elseif ($user !== null) {
                $filters['raised_by'] = $user->id;
            }
        }

        $query = Ticket::query()
            ->with(['project:id,name', 'requester:id,name', 'creator:id,name'])
            ->orderByDesc('created_at');

        $this->applyFilters($query, $filters, true, $staffTeam, $user);

        $fileName = 'tickets-' . now()->format('Ymd-His') . '.csv';

        return response()->streamDownload(function () use ($query) {
            $out = fopen('php://output', 'w');

            fputcsv($out, [
                'Code',
                'Title',
                'Project',
                'Status',
                'Priority',
                'Raised By',
                'Created By',
                'Created At',
            ]);

            $query->chunk(500, function ($tickets) use ($out) {
                foreach ($tickets as $ticket) {
                    fputcsv($out, [
                        $ticket->code,
                        $ticket->title,
                        $ticket->project?->name,
                        $ticket->status,
                        $ticket->priority,
                        $ticket->requester?->name,
                        $ticket->creator?->name,
                        $ticket->created_at?->toDateTimeString(),
                    ]);
                }
            });

            fclose($out);
        }, $fileName, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    private function applyFilters(Builder $query, array $filters, bool $applyStatus, ?string $staffTeam, ?User $user = null): void
    {
        if ($filters['q'] ?? null) {
            $q = trim((string) $filters['q']);
            $query->where(function (Builder $sub) use ($q) {
                $sub->where('code', 'like', "%{$q}%")
                    ->orWhere('title', 'like', "%{$q}%");
            });
        }

        if ($user && $user->role === 'supervisor') {
            // Supervisor bisa melihat ticket dari timnya atau ticket yang berkaitan dengan subordinatesnya
            $supervisorTeam = $this->getStaffTeam($user);
            $subordinateIds = $user->subordinates()->pluck('id')->toArray();
            $query->where(function (Builder $sub) use ($supervisorTeam, $subordinateIds) {
                if ($supervisorTeam) {
                    $sub->orWhere('category', $supervisorTeam);
                }
                if (!empty($subordinateIds)) {
                    $sub->orWhereIn('requester_id', $subordinateIds)
                        ->orWhereIn('creator_id', $subordinateIds)
                        ->orWhereIn('assignee_id', $subordinateIds);
                }
            });
        } elseif ($staffTeam) {
            $query->where('category', $staffTeam);
        } elseif ($filters['category'] ?? null) {
            $query->where('category', $filters['category']);
        }

        if ($filters['project_id'] ?? null) {
            $query->where('project_id', $filters['project_id']);
        }

        if ($filters['raised_by'] ?? null) {
            $query->where('requester_id', $filters['raised_by']);
        }

        if ($filters['created_by'] ?? null) {
            $query->where('creator_id', $filters['created_by']);
        }

        if (($filters['period_start'] ?? null) || ($filters['period_end'] ?? null)) {
            $start = $filters['period_start'] ? Carbon::parse($filters['period_start'])->startOfDay() : null;
            $end = $filters['period_end'] ? Carbon::parse($filters['period_end'])->endOfDay() : null;

            if ($start) {
                $query->where('created_at', '>=', $start);
            }
            if ($end) {
                $query->where('created_at', '<=', $end);
            }
        }

        if ($applyStatus && ($filters['status'] ?? null)) {
            $query->where('status', $filters['status']);
        }
    }

    private function generateTicketCode(string $category): string
    {
        $prefix = match ($category) {
            'IT' => 'IT',
            'IPSRS' => 'IPS',
            default => 'IPS',
        };

        // Find the last ticket with the same prefix, ordered by id descending (faster because id is indexed)
        $last = Ticket::query()
            ->where('code', 'like', $prefix . '%')
            ->orderByDesc('id')
            ->lockForUpdate()
            ->first(['code']);

        $lastSeq = 0;
        if ($last && is_string($last->code)) {
            $suffix = substr($last->code, strlen($prefix));
            if ($suffix !== false && $suffix !== '' && ctype_digit($suffix)) {
                $lastSeq = (int) $suffix;
            }
        }

        $nextSeq = $lastSeq + 1;

        // Use 4 digits for the sequential number
        return $prefix . str_pad((string) $nextSeq, 4, '0', STR_PAD_LEFT);
    }

    private function getStaffTeam(?User $user): ?string
    {
        if ($user === null) {
            return null;
        }

        if ($user->role === 'admin') {
            return null;
        }

        if ($user->role === 'it') {
            return 'IT';
        }

        if ($user->role === 'ipsrs') {
            return 'IPSRS';
        }

        if ($user->role === 'supervisor') {
            return in_array($user->team, ['IT', 'IPSRS'], true) ? $user->team : null;
        }

        if (in_array($user->team, ['IT', 'IPSRS'], true)) {
            return $user->team;
        }

        return null;
    }

    private function ensureCanViewTicket(User $user, Ticket $ticket): void
    {
        $staffTeam = $this->getStaffTeam($user);
        if ($staffTeam) {
            if ($ticket->category !== $staffTeam) {
                abort(403);
            }

            return;
        }

        if ($user->role === 'supervisor') {
            // Supervisor bisa melihat ticket dari timnya atau ticket yang berkaitan dengan subordinatesnya
            $supervisorTeam = $this->getStaffTeam($user);
            if ($supervisorTeam && $ticket->category === $supervisorTeam) {
                return;
            }
            // Cek apakah ticket dibuat oleh subordinatesnya atau ditugaskan ke subordinatesnya
            $subordinateIds = $user->subordinates()->pluck('id')->toArray();
            if (in_array($ticket->requester_id, $subordinateIds) || in_array($ticket->creator_id, $subordinateIds) || in_array($ticket->assignee_id, $subordinateIds)) {
                return;
            }
            abort(403);
        }

        if ($user->role === 'admin') {
            return;
        }

        if ($user->unit_id) {
            if ((int) $ticket->project_id !== (int) $user->unit_id) {
                abort(403);
            }

            return;
        }

        if ((int) $ticket->requester_id !== (int) $user->id) {
            abort(403);
        }
    }
}
