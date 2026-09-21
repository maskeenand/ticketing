<?php

namespace App\Events;

class TicketCreated extends TicketNotificationEvent
{
    public function __construct(
        $ticket,
        $actor = null,
    ) {
        parent::__construct($ticket, $actor, 'ticket_created');
    }
}
