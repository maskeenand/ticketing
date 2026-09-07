<?php

namespace App\Http\Controllers;

use App\Models\EmailLog;
use App\Models\Ticket;
use App\Models\User;
use App\Notifications\TicketCommented;
use App\Notifications\TicketCreated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;

class EmailLogController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if ($user === null || $user->role !== 'admin') {
            abort(403);
        }

        $status   = $request->string('status')->toString() ?: null;
        $q        = $request->string('q')->toString() ?: null;
        $type     = $request->string('type')->toString() ?: null;

        $query = EmailLog::query()->orderByDesc('created_at');

        if ($status) {
            $query->where('status', $status);
        }
        if ($q) {
            $query->where(function ($sub) use ($q) {
                $sub->where('recipient_email', 'like', "%{$q}%")
                    ->orWhere('recipient_name', 'like', "%{$q}%")
                    ->orWhere('subject', 'like', "%{$q}%")
                    ->orWhere('ticket_code', 'like', "%{$q}%");
            });
        }
        if ($type) {
            $query->where('notification_type', $type);
        }

        $logs = $query->paginate(20)->withQueryString();

        // Count per status for badges
        $counts = EmailLog::query()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        return Inertia::render('EmailLog/Index', [
            'logs'    => $logs,
            'counts'  => [
                'all'     => EmailLog::count(),
                'pending' => (int) ($counts['pending'] ?? 0),
                'sent'    => (int) ($counts['sent'] ?? 0),
                'failed'  => (int) ($counts['failed'] ?? 0),
            ],
            'filters' => [
                'status' => $status,
                'q'      => $q,
                'type'   => $type,
            ],
        ]);
    }

    /**
     * Retry a single failed/pending email.
     */
    public function retry(Request $request, EmailLog $emailLog)
    {
        $user = $request->user();
        if ($user === null || $user->role !== 'admin') {
            abort(403);
        }

        if (! in_array($emailLog->status, ['failed', 'pending'], true)) {
            return back()->with('error', 'Hanya email dengan status failed atau pending yang bisa di-retry.');
        }

        $notifiable = $emailLog->notifiable_type && $emailLog->notifiable_id
            ? ($emailLog->notifiable_type)::find($emailLog->notifiable_id)
            : null;

        if (! $notifiable) {
            return back()->with('error', 'Penerima email tidak ditemukan.');
        }

        $payload = is_string($emailLog->payload) ? json_decode($emailLog->payload, true) : [];

        try {
            $notification = $this->buildNotification($emailLog->notification_type, $payload);

            if (! $notification) {
                return back()->with('error', 'Tipe notifikasi tidak dikenali.');
            }

            // Update attempt count and reset to pending
            $emailLog->update([
                'status'        => 'pending',
                'attempt_count' => $emailLog->attempt_count + 1,
                'error_message' => null,
            ]);

            Notification::send([$notifiable], $notification);

            return back()->with('success', "Email ke {$emailLog->recipient_email} berhasil dikirim ulang.");
        } catch (\Throwable $e) {
            $emailLog->markFailed($e->getMessage());

            return back()->with('error', 'Gagal mengirim ulang: ' . $e->getMessage());
        }
    }

    /**
     * Retry all failed emails at once.
     */
    public function retryAll(Request $request)
    {
        $user = $request->user();
        if ($user === null || $user->role !== 'admin') {
            abort(403);
        }

        $failed = EmailLog::where('status', 'failed')->get();

        if ($failed->isEmpty()) {
            return back()->with('error', 'Tidak ada email gagal untuk di-retry.');
        }

        $success = 0;
        $fail    = 0;

        foreach ($failed as $log) {
            $notifiable = $log->notifiable_type && $log->notifiable_id
                ? ($log->notifiable_type)::find($log->notifiable_id)
                : null;

            if (! $notifiable) {
                $fail++;
                continue;
            }

            $payload      = is_string($log->payload) ? json_decode($log->payload, true) : [];
            $notification = $this->buildNotification($log->notification_type, $payload);

            if (! $notification) {
                $fail++;
                continue;
            }

            try {
                $log->update([
                    'status'        => 'pending',
                    'attempt_count' => $log->attempt_count + 1,
                    'error_message' => null,
                ]);

                Notification::send([$notifiable], $notification);
                $success++;
            } catch (\Throwable $e) {
                $log->markFailed($e->getMessage());
                $fail++;
            }
        }

        return back()->with('success', "Retry selesai: {$success} berhasil, {$fail} gagal.");
    }

    private function buildNotification(string $type, array $payload): ?\Illuminate\Notifications\Notification
    {
        $ticketId = $payload['ticket_id'] ?? null;
        $actorId  = $payload['actor_id'] ?? null;

        if (! $ticketId || ! $actorId) {
            return null;
        }

        $ticket = Ticket::with('project')->find($ticketId);
        $actor  = User::find($actorId);

        if (! $ticket || ! $actor) {
            return null;
        }

        return match ($type) {
            'TicketCreated'   => new TicketCreated($ticket, $actor),
            'TicketCommented' => $this->buildCommentedNotification($ticket, $actor, $payload),
            default           => null,
        };
    }

    private function buildCommentedNotification(Ticket $ticket, User $actor, array $payload): ?\Illuminate\Notifications\Notification
    {
        $commentId = $payload['comment_id'] ?? null;
        if (! $commentId) {
            return null;
        }

        $comment = $ticket->comments()->find($commentId);
        if (! $comment) {
            return null;
        }

        return new TicketCommented($ticket, $comment, $actor);
    }
}
