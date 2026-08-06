<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('member')->change();
        });

        // Update existing users
        DB::table('users')->where('role', 'user')->update(['role' => 'member']);
        DB::table('users')->where('role', 'admin_unit')->update(['role' => 'admin']);
        DB::table('users')->where('role', 'umum')->update(['role' => 'ipsrs']);
        DB::table('users')->where('team', 'Umum')->update(['team' => 'IPSRS']);

        // Update existing tickets
        DB::table('tickets')->where('category', 'Umum')->update(['category' => 'IPSRS']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('user')->change();
        });

        // Revert existing users
        DB::table('users')->where('role', 'member')->update(['role' => 'user']);
        DB::table('users')->where('role', 'admin')->update(['role' => 'admin_unit']);
        DB::table('users')->where('role', 'ipsrs')->update(['role' => 'umum']);
        DB::table('users')->where('team', 'IPSRS')->update(['team' => 'Umum']);

        // Revert existing tickets
        DB::table('tickets')->where('category', 'IPSRS')->update(['category' => 'Umum']);
    }
};
