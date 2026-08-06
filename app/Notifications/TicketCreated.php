<?php

namespace App\Notifications;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TicketCreated extends Notification
{
    use Queueable;

    public function __construct(
        private readonly Ticket $ticket,
        private readonly User $actor,
    ) {
    }

    public function via(object $notifiable): array
    {
        $channels = ['database']; // Always use database channel for notifications
        $email = $notifiable->email ?? null;
        if (is_string($email) && trim($email) !== '') {
            $channels[] = 'mail';
        }

        return $channels;
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'ticket_id' => $this->ticket->id,
            'ticket_code' => $this->ticket->code,
            'ticket_title' => $this->ticket->title,
            'actor_name' => $this->actor->name,
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $isRequester = isset($notifiable->id) && (int) $notifiable->id === (int) $this->ticket->requester_id;

        $plainDescription = trim(preg_replace('/\s+/', ' ', strip_tags((string) ($this->ticket->description ?? ''))) ?? '');
        $descriptionExcerpt = $plainDescription !== '' ? mb_substr($plainDescription, 0, 300) : null;

        $subjectPrefix = $isRequester ? 'Ticket berhasil dibuat' : 'Ticket baru';
        $subject = "{$subjectPrefix}: {$this->ticket->code} - {$this->ticket->title}";

        $mail = (new MailMessage)->subject($subject);

        if ($isRequester) {
            $mail->line('Ticket Anda berhasil dibuat.');
        } else {
            $mail->line("Ticket baru dibuat oleh {$this->actor->name}.");
        }

        $mail->line("Kode: {$this->ticket->code}")
            ->line("Judul: {$this->ticket->title}");

        if (is_string($this->ticket->category) && $this->ticket->category !== '') {
            $mail->line("Kategori: {$this->ticket->category}");
        }

        if (is_string($this->ticket->priority) && $this->ticket->priority !== '') {
            $mail->line("Prioritas: {$this->ticket->priority}");
        }

        $projectName = $this->ticket->project?->name;
        if (is_string($projectName) && $projectName !== '') {
            $mail->line("Unit/Project: {$projectName}");
        }

        if ($descriptionExcerpt !== null) {
            $mail->line("Deskripsi: {$descriptionExcerpt}");
        }

        return $mail->action('Lihat Ticket', route('tickets.show', $this->ticket->id));
    }
}

