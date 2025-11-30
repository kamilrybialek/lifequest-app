const CACHE_NAME = 'lifequest-admin-v4-force-update'; // ✅ FORCE UPDATE
const urlsToCache = [];  // NO CACHING - force fresh fetch

// Install event - skip caching, just activate
self.addEventListener('install', (event) => {
  console.log('🔥 Service Worker v4: FORCE UPDATE - No caching, always fresh!');
  // Skip waiting immediately
  self.skipWaiting();
});

// Fetch event - ALWAYS NETWORK, NO CACHE
self.addEventListener('fetch', (event) => {
  // Always fetch from network, never use cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        console.log('✅ Serving fresh from network:', event.request.url);
        return response;
      })
      .catch((error) => {
        console.error('❌ Network fetch failed:', error);
        // Return a basic error response instead of cached version
        return new Response('Network error, please check connection', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  // Sync any offline data when connection is restored
  console.log('Background sync triggered');

  // Get pending operations from IndexedDB
  const pendingOps = await getPendingOperations();

  // Process each pending operation
  for (const op of pendingOps) {
    try {
      await fetch(op.url, {
        method: op.method,
        headers: op.headers,
        body: op.body
      });

      // Remove from pending after successful sync
      await removePendingOperation(op.id);
    } catch (error) {
      console.error('Sync failed for operation:', op.id, error);
    }
  }
}

async function getPendingOperations() {
  // Placeholder - implement IndexedDB storage
  return [];
}

async function removePendingOperation(id) {
  // Placeholder - implement IndexedDB removal
}

// Push notification handler
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};

  const options = {
    body: data.body || 'New notification from LifeQuest Admin',
    icon: './icon-192.png',
    badge: './icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || './index.html'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'LifeQuest Admin', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url || './index.html')
  );
});
