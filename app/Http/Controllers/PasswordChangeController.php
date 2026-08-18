<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = $request->user();

        // cast 'hashed' di model otomatis hash — jangan pakai Hash::make()
        $user->password = $request->password;
        $user->password_changed_at = now();
        $user->save();

        // Re-login agar session tetap valid setelah password berubah
        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->route('dashboard')->with('success', 'Password berhasil diubah');
    }
}
