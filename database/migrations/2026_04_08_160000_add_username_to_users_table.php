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
            $table->string('username')->nullable()->after('name');
        });

        $existing = DB::table('users')
            ->select(['id', 'email'])
            ->orderBy('id')
            ->get();

        $used = DB::table('users')
            ->whereNotNull('username')
            ->pluck('username')
            ->map(fn ($v) => (string) $v)
            ->all();

        $usedMap = array_fill_keys($used, true);

        foreach ($existing as $row) {
            $id = (int) $row->id;
            $email = is_string($row->email) ? $row->email : '';

            $base = '';
            if ($email !== '' && str_contains($email, '@')) {
                $base = explode('@', $email, 2)[0];
            }
            $base = trim($base);
            if ($base === '') {
                $base = 'user';
            }

            $candidate = $base;
            if (isset($usedMap[$candidate])) {
                $candidate = $base.$id;
            }
            while (isset($usedMap[$candidate])) {
                $candidate = $base.$id.'_'.substr(md5($candidate), 0, 4);
            }

            $usedMap[$candidate] = true;

            DB::table('users')
                ->where('id', $id)
                ->whereNull('username')
                ->update(['username' => $candidate]);
        }

        Schema::table('users', function (Blueprint $table) {
            $table->unique('username');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['username']);
            $table->dropColumn('username');
        });
    }
};

