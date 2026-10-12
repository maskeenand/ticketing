<?php

namespace App\Notifications;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class TicketAssignedInApp extends Notification
{
    use Queueable;

    public function __construct(
        private readonly Ticket $ticket,
        private readonly ?User $actor,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        $this->ticket->loadMissing('assignee:id,name');

        $actorName = $this->actor?->name;
        $assigneeName = $this->ticket->assignee?->name;
        $message = 'Tiket ditugaskan';

        if ($assigneeName !== null) {
            $message .= " kepada {$assigneeName}";
        }

        if ($actorName !== null) {
            $message .= " oleh {$actorName}";
        }

        return [
            'type' => 'ticket_assigned',
            'ticket_id' => $this->ticket->id,
            'ticket_code' => $this->ticket->code,
            'ticket_title' => $this->ticket->title,
            'actor_id' => $this->actor?->id,
            'actor_name' => $actorName,
            'assignee_name' => $assigneeName,
            'message' => $message . '.',
            'url' => route('tickets.show', $this->ticket->id),
        ];
    }

    public function toArray(object $notifiable): array
    {
        return $this->toDatabase($notifiable);
    }
}
