<?php

use App\Http\Controllers\PasswordChangeController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\UserManagementController;
use App\Models\Project;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (request()->user() === null) {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    $user = request()->user();

    $query = Ticket::query()
        ->with(['project:id,name'])
        ->orderByDesc('created_at');

    $staffTeam = null;
    if ($user !== null && $user->role === 'it') {
        $staffTeam = 'IT';
    } elseif ($user !== null && $user->role === 'ipsrs') {
        $staffTeam = 'IPSRS';
    } elseif ($user !== null && $user->role !== 'admin' && in_array($user->team, ['IT', 'IPSRS'], true)) {
        $staffTeam = $user->team;
    }

    if ($staffTeam) {
        $query->where('category', $staffTeam);
    } elseif ($user !== null && $user->role !== 'admin' && $user->unit_id) {
        $query->where('project_id', $user->unit_id);
    } elseif ($user !== null && $user->role !== 'admin') {
        $query->where('requester_id', $user->id);
    }

    $statusCounts = (clone $query)
        ->reorder()
        ->selectRaw('status, COUNT(*) as aggregate')
        ->groupBy('status')
        ->pluck('aggregate', 'status');

    $tickets = (clone $query)
        ->limit(5)
        ->get()
        ->map(fn (Ticket $ticket) => [
            'id' => $ticket->id,
            'code' => $ticket->code,
            'title' => $ticket->title,
            'status' => $ticket->status,
            'created_at' => $ticket->created_at?->toISOString(),
            'project' => $ticket->project ? ['id' => $ticket->project->id, 'name' => $ticket->project->name] : null,
        ]);

    $unit = null;
    if ($user !== null && $user->unit_id && $user->role !== 'admin') {
        $unitModel = Project::query()->find($user->unit_id, ['id', 'name', 'code']);
        $unit = $unitModel
            ? ['id' => $unitModel->id, 'name' => $unitModel->name, 'code' => $unitModel->code]
            : null;
    }

    return Inertia::render('Dashboard', [
        'unit' => $unit,
        'statusCounts' => [
            'open' => (int) ($statusCounts['open'] ?? 0),
            'in_progress' => (int) ($statusCounts['in_progress'] ?? 0),
            'pending' => (int) ($statusCounts['pending'] ?? 0),
            'resolved' => (int) ($statusCounts['resolved'] ?? 0),
            'closed' => (int) ($statusCounts['closed'] ?? 0),
        ],
        'tickets' => $tickets,
        'quota' => [
            'total_mandays' => 3,
            'used_mandays' => 0,
            'remaining_mandays' => 3,
            'period_label' => now()->translatedFormat('F Y'),
        ],
        'todayLabel' => now()->translatedFormat('l, F d, Y'),
    ]);
});

Route::get('/dashboard', function () {
    $user = request()->user();

    $query = Ticket::query()
        ->with(['project:id,name'])
        ->orderByDesc('created_at');

    $staffTeam = null;
    if ($user !== null && $user->role === 'it') {
        $staffTeam = 'IT';
    } elseif ($user !== null && $user->role === 'ipsrs') {
        $staffTeam = 'IPSRS';
    } elseif ($user !== null && $user->role !== 'admin' && in_array($user->team, ['IT', 'IPSRS'], true)) {
        $staffTeam = $user->team;
    }

    if ($staffTeam) {
        $query->where('category', $staffTeam);
    } elseif ($user !== null && $user->role !== 'admin' && $user->unit_id) {
        $query->where('project_id', $user->unit_id);
    } elseif ($user !== null && $user->role !== 'admin') {
        $query->where('requester_id', $user->id);
    }

    $statusCounts = (clone $query)
        ->reorder()
        ->selectRaw('status, COUNT(*) as aggregate')
        ->groupBy('status')
        ->pluck('aggregate', 'status');

    $tickets = (clone $query)
        ->limit(5)
        ->get()
        ->map(fn (Ticket $ticket) => [
            'id' => $ticket->id,
            'code' => $ticket->code,
            'title' => $ticket->title,
            'status' => $ticket->status,
            'created_at' => $ticket->created_at?->toISOString(),
            'project' => $ticket->project ? ['id' => $ticket->project->id, 'name' => $ticket->project->name] : null,
        ]);

    $unit = null;
    if ($user !== null && $user->unit_id && $user->role !== 'admin') {
        $unitModel = Project::query()->find($user->unit_id, ['id', 'name', 'code']);
        $unit = $unitModel
            ? ['id' => $unitModel->id, 'name' => $unitModel->name, 'code' => $unitModel->code]
            : null;
    }

    return Inertia::render('Dashboard', [
        'unit' => $unit,
        'statusCounts' => [
            'open' => (int) ($statusCounts['open'] ?? 0),
            'in_progress' => (int) ($statusCounts['in_progress'] ?? 0),
            'pending' => (int) ($statusCounts['pending'] ?? 0),
            'resolved' => (int) ($statusCounts['resolved'] ?? 0),
            'closed' => (int) ($statusCounts['closed'] ?? 0),
        ],
        'tickets' => $tickets,
        'quota' => [
            'total_mandays' => 3,
            'used_mandays' => 0,
            'remaining_mandays' => 3,
            'period_label' => now()->translatedFormat('F Y'),
        ],
        'todayLabel' => now()->translatedFormat('l, F d, Y'),
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/change-password', [\App\Http\Controllers\PasswordChangeController::class, 'show'])->name('password.change');
    Route::post('/change-password', [\App\Http\Controllers\PasswordChangeController::class, 'update'])->name('password.update');

    Route::get('/tickets', [TicketController::class, 'index'])->name('tickets.index');
    Route::get('/tickets/create', [TicketController::class, 'create'])->name('tickets.create');
    Route::post('/tickets', [TicketController::class, 'store'])->name('tickets.store');
    Route::get('/tickets/{ticket}', [TicketController::class, 'show'])->name('tickets.show');
    Route::get('/tickets/{ticket}/attachments/{index}', [TicketController::class, 'downloadAttachment'])
        ->whereNumber('index')
        ->name('tickets.attachments.download');
    Route::get('/tickets/{ticket}/comments/{comment}/attachments/{index}', [TicketController::class, 'downloadCommentAttachment'])
        ->whereNumber('index')
        ->name('tickets.comments.attachments.download');
    Route::post('/tickets/{ticket}/comment', [TicketController::class, 'comment'])->name('tickets.comment');
    Route::post('/tickets/{ticket}/claim', [TicketController::class, 'claim'])->name('tickets.claim');
    Route::post('/tickets/{ticket}/assign', [TicketController::class, 'assign'])->name('tickets.assign');
    Route::patch('/tickets/{ticket}/status', [TicketController::class, 'updateStatus'])->name('tickets.status');
    Route::post('/tickets/{ticket}/feedback', [TicketController::class, 'feedback'])->name('tickets.feedback');
    Route::get('/tickets/export', [TicketController::class, 'export'])->name('tickets.export');

    Route::get('/notifications/{notification}', function (Request $request, string $notification) {
        $user = $request->user();
        if ($user === null) {
            abort(403);
        }

        $n = $user->notifications()->whereKey($notification)->firstOrFail();
        $n->markAsRead();

        $url = is_array($n->data) ? ($n->data['url'] ?? null) : null;
        if (! is_string($url) || $url === '') {
            $url = route('dashboard');
        }

        return redirect($url);
    })->name('notifications.go');

    Route::post('/notifications/read-all', function (Request $request) {
        $user = $request->user();
        if ($user === null) {
            abort(403);
        }

        $user->unreadNotifications()->update(['read_at' => now()]);

        return back();
    })->name('notifications.readAll');

    Route::get('/users', [UserManagementController::class, 'index'])->name('users.index');
    Route::get('/users/create', [UserManagementController::class, 'create'])->name('users.create');
    Route::post('/users', [UserManagementController::class, 'store'])->name('users.store');
    Route::get('/users/{user}/edit', [UserManagementController::class, 'edit'])->name('users.edit');
    Route::patch('/users/{user}', [UserManagementController::class, 'update'])->name('users.update');
    Route::patch('/users/{user}/toggle-active', [UserManagementController::class, 'toggleActive'])->name('users.toggleActive');
});

require __DIR__.'/auth.php';
