<?php

namespace App\Providers;

use App\Events\TicketAssigned;
use App\Events\TicketCommented;
use App\Events\TicketCreated;
use App\Events\TicketResolved;
use App\Events\TicketStatusUpdated;
use App\Listeners\SendTicketNotificationListener;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        TicketCreated::class => [
            SendTicketNotificationListener::class,
        ],
        TicketAssigned::class => [
            SendTicketNotificationListener::class,
        ],
        TicketCommented::class => [
            SendTicketNotificationListener::class,
        ],
        TicketStatusUpdated::class => [
            SendTicketNotificationListener::class,
        ],
        TicketResolved::class => [
            SendTicketNotificationListener::class,
        ],
    ];

    public function boot(): void
    {
        parent::boot();
    }
}
