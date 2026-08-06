<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    protected $fillable = [
        'code',
        'project_id',
        'requester_id',
        'creator_id',
        'assignee_id',
        'title',
        'description',
        'category',
        'type',
        'attachments',
        'status',
        'priority',
        'closed_at',
        'resolved_at',
        'feedback_rating',
        'feedback_comment',
    ];

    protected $casts = [
        'closed_at' => 'datetime',
        'attachments' => 'array',
        'resolved_at' => 'datetime',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(TicketComment::class);
    }

    public function latestComment(): HasOne
    {
        return $this->hasOne(TicketComment::class)->latestOfMany();
    }
}
