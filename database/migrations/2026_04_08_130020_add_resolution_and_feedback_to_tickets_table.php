<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->timestamp('resolved_at')->nullable()->after('closed_at')->index();
            $table->unsignedTinyInteger('feedback_rating')->nullable()->after('resolved_at');
            $table->text('feedback_comment')->nullable()->after('feedback_rating');
        });
    }

    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropColumn(['feedback_comment', 'feedback_rating']);
            $table->dropIndex(['resolved_at']);
            $table->dropColumn('resolved_at');
        });
    }
};

