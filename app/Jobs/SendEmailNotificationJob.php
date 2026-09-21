<?php

namespace App\Jobs;

use App\Mail\TicketNotificationMail;
use App\Models\NotificationLog;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendEmailNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public Ticket $ticket,
        public string $eventType,
    ) {}

    public function handle(): void
    {
        if (empty($this->user->email)) {
            return;
        }

        Mail::to($this->user->email)->send(
            new TicketNotificationMail($this->ticket, $this->eventType)
        );

        NotificationLog::create([
            'event_type' => $this->eventType,
            'user_id' => $this->user->id,
            'channel' => 'email',
            'status' => 'sent',
            'message' => 'Email notification sent',
        ]);
    }
}
