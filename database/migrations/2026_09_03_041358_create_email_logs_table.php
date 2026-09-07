<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('email_logs', function (Blueprint $table) {
            $table->id();
            $table->string('recipient_email');
            $table->string('recipient_name')->nullable();
            $table->string('subject');
            $table->string('notification_type'); // TicketCreated / TicketCommented
            $table->unsignedBigInteger('ticket_id')->nullable();
            $table->string('ticket_code')->nullable();
            $table->string('status')->default('pending'); // pending / sent / failed
            $table->text('error_message')->nullable();
            $table->integer('attempt_count')->default(0);
            $table->timestamp('sent_at')->nullable();
            // Store enough data to retry: notification class + notifiable id
            $table->string('notifiable_type')->nullable();
            $table->unsignedBigInteger('notifiable_id')->nullable();
            $table->text('payload')->nullable(); // JSON serialized notification data
            $table->timestamps();

            $table->index(['status', 'created_at']);
            $table->index('ticket_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_logs');
    }
};
