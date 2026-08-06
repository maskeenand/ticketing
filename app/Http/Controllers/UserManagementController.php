<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class UserManagementController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if ($user === null || !in_array($user->role, ['admin', 'supervisor'])) {
            abort(403);
        }

        $isAdminUnit = $user->role === 'admin';
        $isSupervisor = $user->role === 'supervisor';

        $units = Project::query()->orderBy('name')->get(['id', 'name']);

        $query = User::query()->with(['unit:id,name', 'supervisor:id,name']);

        if ($isSupervisor) {
            $team = $this->getTeam($user);
            $query->where(function ($q) use ($user, $team) {
                $q->where('supervisor_id', $user->id);
                if ($team) {
                    $q->orWhere(function ($sq) use ($team) {
                        $sq->where('team', $team);
                    });
                }
            });
        }

        $users = $query->orderBy('name')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'username' => $u->username,
                'employee_id' => $u->employee_id,
                'email' => $u->email,
                'role' => $u->role,
                'team' => $u->team,
                'is_active' => (bool) ($u->is_active ?? true),
                'unit' => $u->unit ? ['id' => $u->unit->id, 'name' => $u->unit->name] : null,
                'supervisor' => $u->supervisor ? ['id' => $u->supervisor->id, 'name' => $u->supervisor->name] : null,
            ]);

        return Inertia::render('Users/Index', [
            'unit' => null,
            'units' => $units,
            'filters' => [
                'unit_id' => $user->unit_id ? (int) $user->unit_id : null,
            ],
            'users' => $users,
            'isAdminUnit' => $isAdminUnit,
            'isSupervisor' => $isSupervisor,
            'currentUserId' => $user->id,
        ]);
    }

    private function getTeam(User $user): ?string
    {
        if ($user->role === 'it' || $user->team === 'IT' || ($user->unit && ($user->unit->code === 'IT' || $user->unit->code === 'TI'))) return 'IT';
        if ($user->role === 'ipsrs' || $user->team === 'IPSRS' || ($user->unit && $user->unit->code === 'IPSRS')) return 'IPSRS';
        return $user->team;
    }

    public function create(Request $request)
    {
        $user = $request->user();

        if ($user === null || !in_array($user->role, ['admin', 'supervisor'])) {
            abort(403);
        }

        $isAdminUnit = $user->role === 'admin';
        $isSupervisor = $user->role === 'supervisor';

        if ($isSupervisor && !$user->unit_id) {
            abort(403);
        }

        $unit = Project::query()->find($user->unit_id, ['id', 'name', 'code']);
        $units = Project::query()->orderBy('name')->get(['id', 'name']);

        $supervisors = collect();
        if ($isAdminUnit) {
            $supervisors = User::query()
                ->where('role', 'supervisor')
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name']);
        }

        return Inertia::render('Users/Create', [
            'unit' => $unit ? ['id' => $unit->id, 'name' => $unit->name, 'code' => $unit->code] : null,
            'units' => $units,
            'isAdminUnit' => $isAdminUnit,
            'isSupervisor' => $isSupervisor,
            'supervisors' => $supervisors,
            'currentUserId' => $user->id,
            'currentUserTeam' => $this->getTeam($user),
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        if ($user === null || !in_array($user->role, ['admin', 'supervisor'])) {
            abort(403);
        }

        $isSupervisor = $user->role === 'supervisor';

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:50', 'regex:/^[A-Za-z0-9][A-Za-z0-9._-]*$/', 'unique:users,username'],
            'employee_id' => ['nullable', 'string', 'max:50', 'unique:users,employee_id'],
            'email' => ['nullable', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email'],
            'unit_id' => ['required', 'integer', 'exists:projects,id'],
            'role' => ['required', 'in:member,admin,it,ipsrs,supervisor'],
            'supervisor_id' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        // If supervisor, only allow roles of their team and set unit_id to their own
        if ($isSupervisor) {
            $team = $this->getTeam($user);
            $allowedRoles = ['member'];
            if ($team === 'IT') $allowedRoles[] = 'it';
            if ($team === 'IPSRS') $allowedRoles[] = 'ipsrs';

            if (!in_array($validated['role'], $allowedRoles)) {
                abort(403);
            }
            $validated['unit_id'] = $user->unit_id;
            $validated['supervisor_id'] = $user->id;
        }

        $role = $validated['role'];
        $team = null;
        if ($role === 'it') {
            $team = 'IT';
        } elseif ($role === 'ipsrs') {
            $team = 'IPSRS';
        }

        User::query()->create([
            'name' => $validated['name'],
            'username' => $validated['username'],
            'employee_id' => $validated['employee_id'] ?? null,
            'email' => $validated['email'],
            'password' => Hash::make('password'),
            'unit_id' => (int) $validated['unit_id'],
            'role' => $role,
            'team' => $team,
            'supervisor_id' => $validated['supervisor_id'] ?? null,
            'password_changed_at' => null,
        ]);

        return redirect()
            ->route('users.index')
            ->with('success', 'User berhasil dibuat. Password default: password');
    }

    public function edit(Request $request, User $user)
    {
        $authUser = $request->user();
        if ($authUser === null || !in_array($authUser->role, ['admin', 'supervisor'])) {
            abort(403);
        }

        $isAdminUnit = $authUser->role === 'admin';
        $isAdminUnit = $authUser->role === 'admin';
        $isSupervisor = $authUser->role === 'supervisor';

        // If supervisor, only allow editing their subordinates and team members
        if ($isSupervisor) {
            $team = $this->getTeam($authUser);
            $subordinateIds = $authUser->subordinates()->pluck('id')->toArray();
            if ((int)$user->id !== (int)$authUser->id && !in_array((int)$user->id, $subordinateIds) && $user->team !== $team) {
                abort(403);
            }
        }

        $units = Project::query()->orderBy('name')->get(['id', 'name']);

        $supervisors = collect();
        if ($isAdminUnit) {
            $supervisors = User::query()
                ->where('role', 'supervisor')
                ->where('is_active', true)
                ->where('id', '!=', $user->id)
                ->orderBy('name')
                ->get(['id', 'name']);
        }

        return Inertia::render('Users/Edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'employee_id' => $user->employee_id,
                'email' => $user->email,
                'unit_id' => $user->unit_id,
                'role' => $user->role,
                'supervisor_id' => $user->supervisor_id,
                'is_active' => (bool) ($user->is_active ?? true),
            ],
            'units' => $units,
            'isAdminUnit' => $isAdminUnit,
            'isSupervisor' => $isSupervisor,
            'supervisors' => $supervisors,
            'currentUserId' => $authUser->id,
            'currentUserTeam' => $this->getTeam($authUser),
        ]);
    }

    public function update(Request $request, User $user)
    {
        $authUser = $request->user();
        if ($authUser === null || !in_array($authUser->role, ['admin', 'supervisor'])) {
            abort(403);
        }

        $isSupervisor = $authUser->role === 'supervisor';

        // If supervisor, only allow editing their subordinates and team members
        if ($isSupervisor) {
            $team = $this->getTeam($authUser);
            $subordinateIds = $authUser->subordinates()->pluck('id')->toArray();
            if ((int)$user->id !== (int)$authUser->id && !in_array((int)$user->id, $subordinateIds) && $user->team !== $team) {
                abort(403);
            }
        }

        $validationRules = [
            'name' => ['required', 'string', 'max:255'],
            'username' => [
                'required',
                'string',
                'max:50',
                'regex:/^[A-Za-z0-9][A-Za-z0-9._-]*$/',
                Rule::unique('users', 'username')->ignore($user->id),
            ],
            'employee_id' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('users', 'employee_id')->ignore($user->id),
            ],
            'email' => [
                'nullable',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'password' => ['nullable', 'confirmed', Password::defaults()],
        ];

        // Add unit_id and role only for admin
        if ($isAdminUnit) {
            $validationRules['unit_id'] = ['required', 'integer', 'exists:projects,id'];
            $validationRules['role'] = ['required', 'in:member,admin,it,ipsrs,supervisor'];
            $validationRules['supervisor_id'] = ['nullable', 'integer', 'exists:users,id'];
        }

        $validated = $request->validate($validationRules);

        $updates = [
            'name' => $validated['name'],
            'username' => $validated['username'],
            'employee_id' => $validated['employee_id'] ?? null,
            'email' => $validated['email'],
        ];

        // Admin can update role and unit
        if ($isAdminUnit) {
            $role = $validated['role'];
            $team = null;
            if ($role === 'it') {
                $team = 'IT';
            } elseif ($role === 'ipsrs') {
                $team = 'IPSRS';
            }
            $updates['unit_id'] = (int)$validated['unit_id'];
            $updates['role'] = $role;
            $updates['team'] = $team;
            $updates['supervisor_id'] = $validated['supervisor_id'] ?? null;
        }

        if (($validated['password'] ?? '') !== '') {
            $updates['password'] = Hash::make($validated['password']);
        }

        $user->update($updates);

        return redirect()
            ->route('users.index')
            ->with('success', 'User berhasil diupdate.');
    }

    public function toggleActive(Request $request, User $user)
    {
        $authUser = $request->user();
        if ($authUser === null || !in_array($authUser->role, ['admin', 'supervisor'])) {
            abort(403);
        }

        $isSupervisor = $authUser->role === 'supervisor';

        if ((int)$authUser->id === (int)$user->id) {
            return back()->with('error', 'Tidak bisa menonaktifkan akun sendiri.');
        }

        // If supervisor, only allow toggling subordinates
        if ($isSupervisor) {
            $subordinateIds = $authUser->subordinates()->pluck('id')->toArray();
            if (!in_array((int)$user->id, $subordinateIds)) {
                abort(403);
            }
        }

        $current = (bool)($user->is_active ?? true);
        $user->update([
            'is_active' => !$current,
        ]);

        return back()->with('success', $current ? 'User berhasil dinonaktifkan.' : 'User berhasil diaktifkan.');
    }
}
