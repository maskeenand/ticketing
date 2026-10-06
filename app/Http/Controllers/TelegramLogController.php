<?php

namespace App\Http\Controllers;

use App\Models\NotificationLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TelegramLogController extends Controller
{
    public function index(Request $request)
    {
        if ($request->user()?->role !== 'admin') {
            abort(403);
        }

        $requestedStatus = $request->string('status')->toString();
        $status = in_array($requestedStatus, ['sent', 'failed'], true) ? $requestedStatus : null;
        $queryText = $request->string('q')->trim()->toString();
        $eventType = $request->string('event_type')->toString() ?: null;

        $query = NotificationLog::query()
            ->with('user:id,name,email')
            ->where('channel', 'telegram')
            ->orderByDesc('created_at');

        if ($status) {
            $query->where('status', $status);
        }

        if ($eventType) {
            $query->where('event_type', $eventType);
        }

        if ($queryText !== '') {
            $query->where(function ($subQuery) use ($queryText) {
                $subQuery->where('event_type', 'like', "%{$queryText}%")
                    ->orWhere('message', 'like', "%{$queryText}%")
                    ->orWhereHas('user', function ($userQuery) use ($queryText) {
                        $userQuery->where('name', 'like', "%{$queryText}%")
                            ->orWhere('email', 'like', "%{$queryText}%");
                    });
            });
        }

        $statusCounts = NotificationLog::query()
            ->where('channel', 'telegram')
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        return Inertia::render('TelegramLog/Index', [
            'logs' => $query->paginate(25)->withQueryString(),
            'counts' => [
                'all' => NotificationLog::query()->where('channel', 'telegram')->count(),
                'sent' => (int) ($statusCounts['sent'] ?? 0),
                'failed' => (int) ($statusCounts['failed'] ?? 0),
            ],
            'filters' => [
                'status' => $status,
                'q' => $queryText ?: null,
                'event_type' => $eventType,
            ],
        ]);
    }
}