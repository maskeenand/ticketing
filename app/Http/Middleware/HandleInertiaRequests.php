<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        $manifest = public_path('build/manifest.json');
        if (is_file($manifest)) {
            return md5_file($manifest) ?: null;
        }

        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        $defaultConnection = config('database.default');

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
            ],
            'db_host' => config("database.connections.$defaultConnection.host"),
            'db_port' => config("database.connections.$defaultConnection.port"),
            'db_name' => config("database.connections.$defaultConnection.database"),
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'notifications' => [
                'unread_count' => fn () => $user && Schema::hasTable('notifications')
                    ? $user->unreadNotifications()->count()
                    : 0,
                'items' => fn () => $user && Schema::hasTable('notifications')
                    ? $user->notifications()
                        ->latest()
                        ->limit(8)
                        ->get()
                        ->map(fn ($n) => [
                            'id' => $n->id,
                            'read_at' => $n->read_at?->toISOString(),
                            'created_at' => $n->created_at?->toISOString(),
                            'data' => $n->data,
                        ])
                    : [],
            ],
        ];
    }
}
