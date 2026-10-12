<?php

namespace Tests\Feature;

use App\Jobs\SendTelegramNotificationJob;
use App\Models\Ticket;
use App\Models\User;
use ReflectionMethod;
use Tests\TestCase;

class SendTelegramNotificationJobMessageTest extends TestCase
{
    public function test_message_includes_assignee_even_for_ticket_closed_event(): void
    {
        $ticket = new Ticket([
            'title' => 'Pengecekan bau bangkai',
            'status' => 'closed',
        ]);
        $ticket->id = 777;
        $ticket->setRelation('assignee', new User(['name' => 'Petugas IT']));

        $job = new SendTelegramNotificationJob(
            new User(),
            'ticket_status_updated',
            $ticket,
        );

        $buildMessage = new ReflectionMethod($job, 'buildMessage');
        $message = $buildMessage->invoke($job);

        $this->assertStringContainsString('Assign: <b>Petugas IT</b>', $message);
    }
}
