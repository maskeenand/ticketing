<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('employee_id')->nullable()->after('unit_id')->unique();
            $table->string('role')->default('user')->after('employee_id')->index();
        });

        DB::table('users')->where('team', 'IT')->update(['role' => 'it']);
        DB::table('users')->where('team', 'Umum')->update(['role' => 'umum']);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['employee_id']);
            $table->dropIndex(['role']);
            $table->dropColumn(['employee_id', 'role']);
        });
    }
};

