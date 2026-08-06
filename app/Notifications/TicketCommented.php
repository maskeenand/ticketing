<?php

namespace App\Notifications;

use App\Models\Ticket;
use App\Models\TicketComment;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TicketCommented extends Notification
{
    use Queueable;

    public function __construct(
        private readonly Ticket $ticket,
        private readonly TicketComment $comment,
        private readonly User $actor,
    ) {
    }

    public function via(object $notifiable): array
    {
        $channels = ['database'];

        $email = $notifiable->email ?? null;
        if (is_string($email) && trim($email) !== '') {
            $channels[] = 'mail';
        }

        return $channels;
    }

    public function toMail(object $notifiable): MailMessage
    {
        $plain = trim(preg_replace('/\s+/', ' ', strip_tags((string) $this->comment->body)) ?? '');
        $excerpt = $plain !== '' ? mb_substr($plain, 0, 300) : '(tanpa teks)';

        return (new MailMessage)
            ->subject("Balasan Ticket {$this->ticket->code}: {$this->ticket->title}")
            ->line("Ada balasan baru dari {$this->actor->name}.")
            ->line("Ticket: {$this->ticket->code} - {$this->ticket->title}")
            ->line("Pesan: {$excerpt}")
            ->action('Lihat Ticket', route('tickets.show', $this->ticket->id));
    }

    public function toDatabase(object $notifiable): array
    {
        $plain = trim(preg_replace('/\s+/', ' ', strip_tags((string) $this->comment->body)) ?? '');

        return [
            'type' => 'ticket_comment',
            'ticket_id' => $this->ticket->id,
            'ticket_code' => $this->ticket->code,
            'ticket_title' => $this->ticket->title,
            'comment_id' => $this->comment->id,
            'actor_id' => $this->actor->id,
            'actor_name' => $this->actor->name,
            'message' => $plain !== '' ? mb_substr($plain, 0, 160) : null,
            'url' => route('tickets.show', $this->ticket->id),
            'created_at' => $this->comment->created_at?->toISOString(),
        ];
    }

    public function toArray(object $notifiable): array
    {
        return $this->toDatabase($notifiable);
    }
}
