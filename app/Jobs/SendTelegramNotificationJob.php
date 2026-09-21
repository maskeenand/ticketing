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

        $response = Http::post('https://api.telegram.org/bot' . env('TELEGRAM_BOT_TOKEN') . '/sendMessage', [
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

        return sprintf(
            "<b>Ticket #%s</b>\nJudul: %s\nStatus: %s\nEvent: %s\nLink: %s",
            $this->ticket->id,
            $this->ticket->subject ?? 'Ticket',
            $this->ticket->status ?? 'unknown',
            $this->eventType,
            url('/tickets/' . $this->ticket->id)
        );
    }
}
