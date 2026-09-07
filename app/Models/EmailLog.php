<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmailLog extends Model
{
    protected $fillable = [
        'recipient_email',
        'recipient_name',
        'subject',
        'notification_type',
        'ticket_id',
        'ticket_code',
        'status',
        'error_message',
        'attempt_count',
        'sent_at',
        'notifiable_type',
        'notifiable_id',
        'payload',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
        'attempt_count' => 'integer',
        'ticket_id' => 'integer',
        'notifiable_id' => 'integer',
    ];

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class);
    }

    public function markSent(): void
    {
        $this->update([
            'status' => 'sent',
            'sent_at' => now(),
            'error_message' => null,
        ]);
    }

    public function markFailed(string $error): void
    {
        $this->update([
            'status' => 'failed',
            'error_message' => mb_substr($error, 0, 2000),
        ]);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    public function scopeSent($query)
    {
        return $query->where('status', 'sent');
    }
}
