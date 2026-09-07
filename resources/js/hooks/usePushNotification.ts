import { router, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

type PermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

export function usePushNotification() {
    const { vapidPublicKey } = usePage().props as Record<string, unknown> & { vapidPublicKey?: string };
    const [permission, setPermission] = useState<PermissionState>('default');
    const [subscribed, setSubscribed] = useState(false);

    // Check current state on mount
    useEffect(() => {
        if (!('Notification' in window) || !('serviceWorker' in navigator)) {
            setPermission('unsupported');
            return;
        }
        setPermission(Notification.permission as PermissionState);

        // Check if already subscribed
        navigator.serviceWorker.ready.then((reg) => {
            reg.pushManager.getSubscription().then((sub) => {
                setSubscribed(!!sub);
            });
        });
    }, []);

    // Register service worker on mount
    useEffect(() => {
        if (!('serviceWorker' in navigator)) return;
        navigator.serviceWorker.register('/sw.js').catch(() => {/* silent */});
    }, []);

    const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
        const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
        const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const raw     = window.atob(base64);
        return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
    };

    const getBrowserName = (): string => {
        const ua = navigator.userAgent;
        if (ua.includes('Firefox'))  return 'firefox';
        if (ua.includes('Edg'))      return 'edge';
        if (ua.includes('Chrome'))   return 'chrome';
        if (ua.includes('Safari'))   return 'safari';
        return 'unknown';
    };

    const subscribe = useCallback(async (): Promise<boolean> => {
        if (!vapidPublicKey) return false;

        try {
            const perm = await Notification.requestPermission();
            setPermission(perm as PermissionState);
            if (perm !== 'granted') return false;

            const reg = await navigator.serviceWorker.ready;
            const sub = await reg.pushManager.subscribe({
                userVisibleOnly:      true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
            });

            const json    = sub.toJSON();
            const keys    = json.keys ?? {};

            await fetch(route('push.subscribe'), {
                method:  'POST',
                headers: {
                    'Content-Type':  'application/json',
                    'X-CSRF-TOKEN':  (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '',
                },
                body: JSON.stringify({
                    endpoint:   sub.endpoint,
                    p256dh_key: keys.p256dh   ?? null,
                    auth_token: keys.auth     ?? null,
                    browser:    getBrowserName(),
                }),
            });

            setSubscribed(true);
            return true;
        } catch {
            return false;
        }
    }, [vapidPublicKey]);

    const unsubscribe = useCallback(async (): Promise<boolean> => {
        try {
            const reg = await navigator.serviceWorker.ready;
            const sub = await reg.pushManager.getSubscription();
            if (!sub) { setSubscribed(false); return true; }

            await fetch(route('push.unsubscribe'), {
                method:  'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '',
                },
                body: JSON.stringify({ endpoint: sub.endpoint }),
            });

            await sub.unsubscribe();
            setSubscribed(false);
            return true;
        } catch {
            return false;
        }
    }, []);

    return { permission, subscribed, subscribe, unsubscribe };
}
