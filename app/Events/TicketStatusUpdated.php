<?php

namespace App\Events;

class TicketStatusUpdated extends TicketNotificationEvent
{
    public function __construct(
        $ticket,
        $actor = null,
    ) {
        parent::__construct($ticket, $actor, 'ticket_status_updated');
    }
}
