<?php

namespace Tests\Feature;

use App\Models\Ticket;
use App\Models\User;
use App\Notifications\TicketAssignedInApp;
use Tests\TestCase;

class TicketAssignedInAppNotificationTest extends TestCase
{
    public function test_assignment_notification_includes_assigner_and_assignee(): void
    {
        $ticket = new Ticket([
            'code' => 'TKT-744',
            'title' => 'Pengisian oksigen',
        ]);
        $ticket->id = 744;
        $ticket->setRelation('assignee', new User(['name' => 'Petugas Penerima']));

        $actor = new User(['name' => 'Petugas Assign']);
        $actor->id = 18;

        $notification = new TicketAssignedInApp($ticket, $actor);
        $data = $notification->toDatabase(new User());

        $this->assertSame('ticket_assigned', $data['type']);
        $this->assertSame('Petugas Assign', $data['actor_name']);
        $this->assertSame('Petugas Penerima', $data['assignee_name']);
        $this->assertSame('Tiket ditugaskan kepada Petugas Penerima oleh Petugas Assign.', $data['message']);
        $this->assertSame(route('tickets.show', 744), $data['url']);
    }
}
