<?php

namespace App\Http\Controllers;

use App\Models\PushSubscription;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Minishlink\WebPush\Subscription;
use Minishlink\WebPush\WebPush;

class PushSubscriptionController extends Controller
{
    /**
     * Return VAPID public key for the frontend to use when subscribing.
     */
    public function vapidKey(): JsonResponse
    {
        return response()->json([
            'public_key' => config('app.vapid_public_key'),
        ]);
    }

    /**
     * Save a new push subscription for the authenticated user.
     */
    public function subscribe(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user === null) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $validated = $request->validate([
            'endpoint'         => ['required', 'string', 'max:2000'],
            'p256dh_key'       => ['nullable', 'string', 'max:500'],
            'auth_token'       => ['nullable', 'string', 'max:500'],
            'browser'          => ['nullable', 'string', 'max:50'],
        ]);

        // Upsert by endpoint — same device re-subscribing should update keys
        PushSubscription::updateOrCreate(
            ['endpoint' => $validated['endpoint']],
            [
                'user_id'    => $user->id,
                'p256dh_key' => $validated['p256dh_key'] ?? null,
                'auth_token' => $validated['auth_token'] ?? null,
                'browser'    => $validated['browser'] ?? null,
            ]
        );

        return response()->json(['ok' => true]);
    }

    /**
     * Remove a push subscription.
     */
    public function unsubscribe(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user === null) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $endpoint = $request->input('endpoint');
        if ($endpoint) {
            PushSubscription::where('user_id', $user->id)
                ->where('endpoint', $endpoint)
                ->delete();
        }

        return response()->json(['ok' => true]);
    }

    /**
     * Build a WebPush instance with VAPID auth.
     */
    public static function buildWebPush(): WebPush
    {
        $auth = [
            'VAPID' => [
                'subject'    => config('app.vapid_subject'),
                'publicKey'  => config('app.vapid_public_key'),
                'privateKey' => config('app.vapid_private_key'),
            ],
        ];

        return new WebPush($auth);
    }

    /**
     * Send a push notification to all subscriptions of given user IDs.
     *
     * @param array<int> $userIds
     */
    public static function sendToUsers(array $userIds, string $title, string $body, string $url = '/'): void
    {
        if (empty($userIds)) {
            return;
        }

        $subscriptions = PushSubscription::whereIn('user_id', $userIds)->get();
        if ($subscriptions->isEmpty()) {
            return;
        }

        try {
            $webPush = self::buildWebPush();

            $payload = json_encode([
                'title' => $title,
                'body'  => $body,
                'url'   => $url,
                'icon'  => '/logo-ticketing.png',
                'badge' => '/icon-192.png',
            ]);

            $staleEndpoints = [];

            foreach ($subscriptions as $sub) {
                $subscription = Subscription::create([
                    'endpoint'        => $sub->endpoint,
                    'publicKey'       => $sub->p256dh_key,
                    'authToken'       => $sub->auth_token,
                    'contentEncoding' => 'aesgcm',
                ]);

                $webPush->queueNotification($subscription, $payload);
            }

            foreach ($webPush->flush() as $report) {
                if (! $report->isSuccess()) {
                    // 404/410 means subscription is no longer valid — remove it
                    $statusCode = $report->getResponse()?->getStatusCode();
                    if (in_array($statusCode, [404, 410], true)) {
                        $staleEndpoints[] = $report->getEndpoint();
                    }
                }
            }

            if (! empty($staleEndpoints)) {
                PushSubscription::whereIn('endpoint', $staleEndpoints)->delete();
            }
        } catch (\Throwable $e) {
            \Log::warning('Web push failed: ' . $e->getMessage());
        }
    }
}
