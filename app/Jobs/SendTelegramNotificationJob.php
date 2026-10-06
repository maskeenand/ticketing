<?php

namespace App\Jobs;

use App\Models\NotificationLog;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;

class SendTelegramNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public string $eventType = 'telegram_test',
        public ?Ticket $ticket = null,
    ) {}

    public function handle(): void
    {
        if (empty($this->user->telegram_chat_id)) {
            return;
        }

        $response = Http::post('https://api.telegram.org/bot' . config('services.telegram.bot_token') . '/sendMessage', [
            'chat_id' => $this->user->telegram_chat_id,
            'text' => $this->buildMessage(),
            'parse_mode' => 'HTML',
        ]);

        NotificationLog::create([
            'event_type' => $this->eventType,
            'user_id' => $this->user->id,
            'channel' => 'telegram',
            'status' => $response->successful() ? 'sent' : 'failed',
            'message' => $response->successful() ? 'Telegram notification sent' : $response->body(),
            'provider_message_id' => $response->json('result.message_id') ?? null,
        ]);
    }

    protected function buildMessage(): string
    {
        if ($this->ticket === null) {
            return sprintf(
                "<b>Test Telegram</b>\nPesan ini dikirim untuk memastikan notifikasi Telegram Anda berfungsi.\nWaktu: %s",
                now()->translatedFormat('d F Y, H:i')
            );
        }

        $this->ticket->loadMissing(['project', 'requester', 'creator']);

        $escape = static fn (?string $value): string => htmlspecialchars(
            $value ?? '-',
            ENT_QUOTES | ENT_SUBSTITUTE,
            'UTF-8'
        );
        $eventLabel = $this->eventType === 'ticket_status_updated' && $this->ticket->status === 'closed'
            ? 'Tiket ditutup'
            : $this->eventType;

        return sprintf(
            "<b>Tiket #%s</b>\nJudul Tiket: %s\nUnit Pengirim: <b>%s</b>\nUser Pengirim: <b>%s</b>\nStatus: %s\nEvent: %s\nLink: %s\nWaktu: %s",
            $this->ticket->id,
            $escape($this->ticket->title),
            $escape($this->ticket->project?->name ?? $this->ticket->category),
            $escape($this->ticket->requester?->name ?? $this->ticket->creator?->name),
            $escape($this->ticket->status ?? 'unknown'),
            $escape($eventLabel),
            $escape(url('/tickets/' . $this->ticket->id)),
            now()->translatedFormat('d F Y, H:i')
        );
    }
}
