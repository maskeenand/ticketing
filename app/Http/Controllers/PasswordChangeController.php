<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class PasswordChangeController extends Controller
{
    public function show()
    {
        return Inertia::render('Auth/ChangePassword');
    }

    public function update(Request $request)
    {
        $request->validate([
            'password' => ['required', 'confirmed', Password::min(6)],
        ]);

        $user = $request->user();

        // Update langsung ke DB — bypass Eloquent cast sepenuhnya
        $affected = DB::table('users')->where('id', $user->id)->update([
            'password'            => Hash::make($request->password),
            'password_changed_at' => now()->toDateTimeString(),
        ]);

        if ($affected === 0) {
            return back()->withErrors(['password' => 'Gagal menyimpan password. Silakan coba lagi.']);
        }

        // Refresh instance user di guard agar middleware membaca data terbaru
        $user->refresh();

        return redirect()->route('dashboard')->with('success', 'Password berhasil diubah');
    }
}
