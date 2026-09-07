<?php

namespace App\Listeners;

use App\Models\EmailLog;
use Illuminate\Mail\Events\MessageFailed;
use Illuminate\Mail\Events\MessageSent;

class LogEmailResult
{
    /**
     * Handle MessageSent — mark the matching pending log as sent.
     */
    public function handleSent(MessageSent $event): void
    {
        $to = collect($event->message->getTo())->keys()->first();
        if (! $to) {
            return;
        }

        EmailLog::where('recipient_email', $to)
            ->where('status', 'pending')
            ->latest()
            ->first()
            ?->markSent();
    }

    /**
     * Handle MessageFailed — mark the matching pending log as failed.
     */
    public function handleFailed(MessageFailed $event): void
    {
        $to = collect($event->message->getTo())->keys()->first();
        if (! $to) {
            return;
        }

        $error = $event->exception?->getMessage() ?? 'Unknown error';

        EmailLog::where('recipient_email', $to)
            ->where('status', 'pending')
            ->latest()
            ->first()
            ?->markFailed($error);
    }
}
