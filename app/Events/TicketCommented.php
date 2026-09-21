<?php

namespace App\Events;

class TicketCommented extends TicketNotificationEvent
{
    public function __construct(
        $ticket,
        $actor = null,
    ) {
        parent::__construct($ticket, $actor, 'ticket_commented');
    }
}