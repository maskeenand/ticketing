<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;

class PasswordController extends Controller
{
    /**
     * Update the user's password.
     * cast 'hashed' on User model handles hashing automatically.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password'         => ['required', Password::defaults(), 'confirmed'],
        ]);

        $user = $request->user();
        $user->update([
            'password'             => $validated['password'],
            'password_changed_at'  => now(),
        ]);

        // Re-login agar session tetap valid
        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->route('dashboard');
    }
}
