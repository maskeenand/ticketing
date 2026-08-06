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

        if ($user && $user->password_changed_at === null) {
            if (! $request->routeIs('password.change') && ! $request->routeIs('password.update') && ! $request->routeIs('logout')) {
                return Redirect::route('password.change');
            }
        }

        return $next($request);
    }
}
