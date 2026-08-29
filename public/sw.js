self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || 'Sehatak Medication Reminder';
    const options = {
      body: data.body || 'It is time to take your scheduled dose.',
      icon: data.icon || '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      vibrate: [200, 100, 200],
      data: {
        url: data.url || '/',
        logId: data.logId,
      },
      actions: [
        { action: 'take', title: 'Mark as Taken' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error('Error handling push event in SW:', err);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action;
  const targetUrl = event.notification.data?.url || '/';

  if (action === 'take') {
    // Action trigger
    event.waitUntil(
      clients.openWindow(targetUrl + '?action=took_dose')
    );
  } else {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if (client.url === targetUrl && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
    );
  }
});
