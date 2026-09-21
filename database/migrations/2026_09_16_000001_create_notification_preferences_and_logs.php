<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('telegram_chat_id')->nullable()->after('email');
            $table->string('telegram_username')->nullable()->after('telegram_chat_id');
        });

        Schema::create('user_notification_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            $table->boolean('email_enabled')->default(true);
            $table->boolean('telegram_enabled')->default(false);

            $table->boolean('ticket_created')->default(true);
            $table->boolean('ticket_assigned')->default(true);
            $table->boolean('ticket_status_updated')->default(true);
            $table->boolean('ticket_commented')->default(false);
            $table->boolean('ticket_resolved')->default(true);

            $table->timestamps();
        });

        Schema::create('notification_logs', function (Blueprint $table) {
            $table->id();
            $table->string('event_type');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('channel');
            $table->string('status');
            $table->text('message')->nullable();
            $table->string('provider_message_id')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_logs');
        Schema::dropIfExists('user_notification_preferences');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['telegram_chat_id', 'telegram_username']);
        });
    }
};
