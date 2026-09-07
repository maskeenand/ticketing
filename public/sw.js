// Service Worker for Web Push Notifications
// Handles background push events when the app is not open

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
    if (!event.data) return;

    let data = {};
    try {
        data = event.data.json();
    } catch (e) {
        data = { title: 'Notifikasi Baru', body: event.data.text() };
    }

    const title   = data.title  ?? 'Tiket Helpdesk';
    const options = {
        body:    data.body  ?? '',
        icon:    data.icon  ?? '/logo-ticketing.png',
        badge:   data.badge ?? '/icon-192.png',
        tag:     data.url   ?? '/',
        renotify: true,
        silent:  false,
        vibrate: [200, 100, 200],
        data: {
            url: data.url ?? '/',
            type: data.type ?? 'helpdesk',
        },
        actions: [
            { action: 'open',    title: 'Buka Tiket' },
            { action: 'dismiss', title: 'Tutup'      },
        ],
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'dismiss') return;

    const targetUrl = event.notification.data?.url ?? '/';

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
            // If app is already open, focus it and navigate
            for (const client of clients) {
                if ('focus' in client) {
                    client.focus();
                    if ('navigate' in client) {
                        client.navigate(targetUrl);
                    }
                    return;
                }
            }
            // Otherwise open a new window
            if (self.clients.openWindow) {
                return self.clients.openWindow(targetUrl);
            }
        })
    );
});
