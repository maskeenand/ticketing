<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $helpdeskUnit = Project::query()->firstOrCreate(
            ['code' => 'HELPDESK'],
            ['name' => 'Helpdesk Internal'],
        );

        $defaultUnits = [
            ['code' => 'IGD', 'name' => 'IGD'],
            ['code' => 'RAWAT-INAP', 'name' => 'Rawat Inap'],
            ['code' => 'RAWAT-JALAN', 'name' => 'Rawat Jalan'],
            ['code' => 'KEUANGAN', 'name' => 'Keuangan'],
            ['code' => 'HRD', 'name' => 'HRD'],
            ['code' => 'FARMASI', 'name' => 'Farmasi'],
            ['code' => 'LAB', 'name' => 'Laboratorium'],
            ['code' => 'RADIOLOGI', 'name' => 'Radiologi'],
            ['code' => 'OETOMO-MAINT', 'name' => 'RS Oetomo - Maintenance'],
        ];

        foreach ($defaultUnits as $unit) {
            Project::query()->firstOrCreate(
                ['code' => $unit['code']],
                ['name' => $unit['name']],
            );
        }

        User::query()->updateOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'username' => 'testuser',
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'remember_token' => Str::random(10),
                'unit_id' => $helpdeskUnit->id,
                'role' => 'member',
                'password_changed_at' => null,
            ],
        );

        User::query()->updateOrCreate(
            ['email' => 'it@example.com'],
            [
                'name' => 'Petugas IT',
                'username' => 'it',
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'remember_token' => Str::random(10),
                'team' => 'IT',
                'role' => 'it',
                'unit_id' => $helpdeskUnit->id,
                'password_changed_at' => null,
            ],
        );

        User::query()->updateOrCreate(
            ['email' => 'umum@example.com'],
            [
                'name' => 'Petugas IPSRS',
                'username' => 'ipsrs',
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'remember_token' => Str::random(10),
                'team' => 'IPSRS',
                'role' => 'ipsrs',
                'unit_id' => $helpdeskUnit->id,
                'password_changed_at' => null,
            ],
        );

        User::query()->updateOrCreate(
            ['email' => 'adminunit@example.com'],
            [
                'name' => 'Admin',
                'username' => 'admin',
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'remember_token' => Str::random(10),
                'unit_id' => $helpdeskUnit->id,
                'role' => 'admin',
                'password_changed_at' => null,
            ],
        );

        $itUser = User::query()->where('email', 'it@example.com')->first();
        $umumUser = User::query()->where('email', 'umum@example.com')->first();

        User::query()->updateOrCreate(
            ['email' => 'supervisor-it@example.com'],
            [
                'name' => 'Supervisor IT',
                'username' => 'supervisor-it',
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'remember_token' => Str::random(10),
                'team' => 'IT',
                'role' => 'supervisor',
                'unit_id' => $helpdeskUnit->id,
                'password_changed_at' => null,
            ],
        );

        User::query()->updateOrCreate(
            ['email' => 'supervisor-umum@example.com'],
            [
                'name' => 'Supervisor IPSRS',
                'username' => 'supervisor-ipsrs',
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'remember_token' => Str::random(10),
                'team' => 'IPSRS',
                'role' => 'supervisor',
                'unit_id' => $helpdeskUnit->id,
                'password_changed_at' => null,
            ],
        );

        // Add subordinates for Supervisor IT
        $itSubordinates = [
            ['email' => 'it-staff1@example.com', 'name' => 'IT Staff 1', 'username' => 'it-staff1'],
            ['email' => 'it-staff2@example.com', 'name' => 'IT Staff 2', 'username' => 'it-staff2'],
        ];

        foreach ($itSubordinates as $data) {
            User::query()->updateOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'username' => $data['username'],
                    'email_verified_at' => now(),
                    'password' => Hash::make('password'),
                    'remember_token' => Str::random(10),
                    'team' => 'IT',
                    'role' => 'it',
                    'unit_id' => $helpdeskUnit->id,
                    'password_changed_at' => null,
                ],
            );
        }

        // Add subordinates for Supervisor IPSRS
        $umumSubordinates = [
            ['email' => 'umum-staff1@example.com', 'name' => 'IPSRS Staff 1', 'username' => 'ipsrs-staff1'],
            ['email' => 'umum-staff2@example.com', 'name' => 'IPSRS Staff 2', 'username' => 'ipsrs-staff2'],
        ];

        foreach ($umumSubordinates as $data) {
            User::query()->updateOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'username' => $data['username'],
                    'email_verified_at' => now(),
                    'password' => Hash::make('password'),
                    'remember_token' => Str::random(10),
                    'team' => 'IPSRS',
                    'role' => 'ipsrs',
                    'unit_id' => $helpdeskUnit->id,
                    'password_changed_at' => null,
                ],
            );
        }

        // Set supervisor for IT and IPSRS users and subordinates
        $supervisorIT = User::query()->where('email', 'supervisor-it@example.com')->first();
        $supervisorUmum = User::query()->where('email', 'supervisor-umum@example.com')->first();

        if ($itUser && $supervisorIT) {
            $itUser->update(['supervisor_id' => $supervisorIT->id]);
        }

        if ($umumUser && $supervisorUmum) {
            $umumUser->update(['supervisor_id' => $supervisorUmum->id]);
        }

        // Set supervisor for IT subordinates
        if ($supervisorIT) {
            foreach ($itSubordinates as $data) {
                $user = User::query()->where('email', $data['email'])->first();
                if ($user) {
                    $user->update(['supervisor_id' => $supervisorIT->id]);
                }
            }
        }

        // Set supervisor for Umum subordinates
        if ($supervisorUmum) {
            foreach ($umumSubordinates as $data) {
                $user = User::query()->where('email', $data['email'])->first();
                if ($user) {
                    $user->update(['supervisor_id' => $supervisorUmum->id]);
                }
            }
        }
    }
}
