<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Redirect;

class EnsurePasswordIsChanged
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user) {
            // Ambil langsung dari DB agar selalu dapat nilai terbaru
            $changedAt = \Illuminate\Support\Facades\DB::table('users')
                ->where('id', $user->id)
                ->value('password_changed_at');

            if ($changedAt === null) {
                $isPasswordRoute = $request->routeIs('password.change')
                    || $request->routeIs('password.change.update')
                    || $request->is('change-password')
                    || $request->routeIs('logout');

                if (! $isPasswordRoute) {
                    return Redirect::route('password.change');
                }
            }
        }

        return $next($request);
    }
}
