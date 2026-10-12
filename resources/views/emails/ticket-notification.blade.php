@component('mail::message')
# Ticket Notification

Event: {{ $eventType }}

@if($eventType === 'ticket_assigned' && $actor)
Di-assign oleh: {{ $actor->name }}
@endif

Ticket #{{ $ticket->id }}
Judul: {{ $ticket->subject ?? $ticket->title ?? 'Ticket' }}
Status: {{ $ticket->status }}

Klik link berikut untuk melihat detail:
{{ url('/tickets/' . $ticket->id) }}

Terima kasih,<br>
{{ config('app.name') }}
@endcomponent
