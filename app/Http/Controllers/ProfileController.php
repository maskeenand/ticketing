<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Jobs\SendTelegramNotificationJob;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $user->fill($request->validated());

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Upload avatar.
     */
    public function uploadAvatar(Request $request): RedirectResponse
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $user = $request->user();

        // Delete old avatar if exists
        if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
            Storage::disk('public')->delete($user->avatar);
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar' => $path]);

        return Redirect::route('profile.edit')->with('status', 'avatar-updated');
    }

    public function connectTelegram(Request $request): RedirectResponse
    {
        abort_unless($request->user()?->role === 'admin', 403);

        $data = $request->validate([
            'telegram_chat_id' => ['nullable', 'string', 'max:50'],
            'telegram_username' => ['nullable', 'string', 'max:100'],
        ]);

        $user = $request->user();

        $user->update([
            'telegram_chat_id' => trim((string) ($data['telegram_chat_id'] ?? '')) ?: null,
            'telegram_username' => trim((string) ($data['telegram_username'] ?? '')) ?: null,
        ]);

        return Redirect::route('profile.edit')->with('status', 'telegram-connected');
    }

    public function testTelegram(Request $request): RedirectResponse
    {
        abort_unless($request->user()?->role === 'admin', 403);

        $user = $request->user();
        $chatId = trim((string) $request->input('telegram_chat_id', ''));

        if ($chatId !== '' && ! preg_match('/^-?\d+$/', $chatId)) {
            return Redirect::route('profile.edit')->withErrors([
                'telegram_chat_id' => 'Chat ID harus berupa angka, bukan username seperti @nama_user.',
            ]);
        }

        if ($chatId !== '') {
            $user->update(['telegram_chat_id' => $chatId]);
        }

        if (empty($user->telegram_chat_id)) {
            return Redirect::route('profile.edit')->withErrors([
                'telegram_chat_id' => 'Chat ID Telegram belum diisi.',
            ]);
        }

        SendTelegramNotificationJob::dispatchSync(
            $user,
            'telegram_test',
            null,
        );

        return Redirect::route('profile.edit')->with('status', 'telegram-test-sent');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
