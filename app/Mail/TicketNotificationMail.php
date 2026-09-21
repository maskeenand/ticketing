<?php

namespace App\Mail;

use App\Models\Ticket;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class TicketNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Ticket $ticket,
        public string $eventType,
    ) {}

    public function build(): self
    {
        return $this->subject('Ticket Notification #' . $this->ticket->id)
            ->markdown('emails.ticket-notification', [
                'ticket' => $this->ticket,
                'eventType' => $this->eventType,
            ]);
    }
}
