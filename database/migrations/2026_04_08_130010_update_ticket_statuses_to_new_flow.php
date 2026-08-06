<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('tickets')->where('status', 'qc')->update(['status' => 'pending']);
        DB::table('tickets')->where('status', 'review')->update(['status' => 'pending']);
        DB::table('tickets')->where('status', 'done')->update(['status' => 'resolved']);
    }

    public function down(): void
    {
        DB::table('tickets')->where('status', 'pending')->update(['status' => 'qc']);
        DB::table('tickets')->where('status', 'resolved')->update(['status' => 'done']);
    }
};

