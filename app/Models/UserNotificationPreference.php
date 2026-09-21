<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserNotificationPreference extends Model
{
    protected $fillable = [
        'user_id',
        'email_enabled',
        'telegram_enabled',
        'ticket_created',
        'ticket_assigned',
        'ticket_status_updated',
        'ticket_commented',
        'ticket_resolved',
    ];

    protected $casts = [
        'email_enabled' => 'boolean',
        'telegram_enabled' => 'boolean',
        'ticket_created' => 'boolean',
        'ticket_assigned' => 'boolean',
        'ticket_status_updated' => 'boolean',
        'ticket_commented' => 'boolean',
        'ticket_resolved' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
