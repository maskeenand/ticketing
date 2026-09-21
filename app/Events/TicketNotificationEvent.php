<?php

namespace App\Events;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

abstract class TicketNotificationEvent
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Ticket $ticket,
        public ?User $actor = null,
        public string $eventType = 'ticket_notification',
    ) {}
}
