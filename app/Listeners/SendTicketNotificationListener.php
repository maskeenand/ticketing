<?php

namespace App\Listeners;

use App\Events\TicketNotificationEvent;
use App\Services\NotificationDispatcher;

class SendTicketNotificationListener
{
    public function __construct(
        protected NotificationDispatcher $dispatcher,
    ) {}

    public function handle(TicketNotificationEvent $event): void
    {
        $this->dispatcher->dispatch($event->ticket, $event->eventType);
    }
}
