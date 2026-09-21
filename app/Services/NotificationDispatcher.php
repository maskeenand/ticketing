<?php

namespace App\Services;

use App\Jobs\SendEmailNotificationJob;
use App\Jobs\SendTelegramNotificationJob;
use App\Models\Ticket;
use App\Models\User;

class NotificationDispatcher
{
    public function dispatch(Ticket $ticket, string $eventType): void
    {
        $recipients = $this->resolveRecipients($ticket);

        foreach ($recipients as $user) {
            $preferences = $user->notificationPreference;

            if ($this->shouldSendEmail($preferences, $eventType)) {
                SendEmailNotificationJob::dispatch($user, $ticket, $eventType);
            }

            if ($this->shouldSendTelegram($preferences, $eventType) && !empty($user->telegram_chat_id)) {
                SendTelegramNotificationJob::dispatch($user, $eventType, $ticket);
            }
        }
    }

    protected function resolveRecipients(Ticket $ticket): array
    {
        $users = collect();

        if ($ticket->requester) {
            $users->push($ticket->requester);
        }

        if ($ticket->assignee) {
            $users->push($ticket->assignee);
        }

        if ($ticket->creator) {
            $users->push($ticket->creator);
        }

        return $users->unique('id')->all();
    }

    protected function shouldSendEmail(?object $preferences, string $eventType): bool
    {
        if (! $preferences) {
            return true;
        }

        if (! $preferences->email_enabled) {
            return false;
        }

        return match ($eventType) {
            'ticket_created' => (bool) $preferences->ticket_created,
            'ticket_assigned' => (bool) $preferences->ticket_assigned,
            'ticket_status_updated' => (bool) $preferences->ticket_status_updated,
            'ticket_commented' => (bool) $preferences->ticket_commented,
            'ticket_resolved' => (bool) $preferences->ticket_resolved,
            default => true,
        };
    }

    protected function shouldSendTelegram(?object $preferences, string $eventType): bool
    {
        if (! $preferences) {
            return false;
        }

        if (! $preferences->telegram_enabled) {
            return false;
        }

        return match ($eventType) {
            'ticket_created' => (bool) $preferences->ticket_created,
            'ticket_assigned' => (bool) $preferences->ticket_assigned,
            'ticket_status_updated' => (bool) $preferences->ticket_status_updated,
            'ticket_commented' => (bool) $preferences->ticket_commented,
            'ticket_resolved' => (bool) $preferences->ticket_resolved,
            default => true,
        };
    }
}
