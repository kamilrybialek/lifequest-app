const CACHE_NAME = 'lifequest-admin-v2'; // ✅ UPDATED VERSION
const urlsToCache = [
  './manifest.json'
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing v2 with new features...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(urlsToCache);
      })
  );
  // Force waiting SW to become active immediately
  self.skipWaiting();
});

// Fetch event - NETWORK FIRST for HTML, cache first for assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // For HTML files (index.html), always try network first
  if (event.request.method === 'GET' &&
      (url.pathname.endsWith('.html') || url.pathname.endsWith('/'))) {

    event.respondWith(
      // Try network first
      fetch(event.request)
        .then((response) => {
          // Clone and cache the new version
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          console.log('Service Worker: Serving fresh HTML from network');
          return response;
        })
        .catch(() => {
          // Fallback to cache if offline
          console.log('Service Worker: Network failed, serving cached HTML');
          return caches.match(event.request);
        })
    );
  }
  // For other assets (CSS, JS, images), use cache first
  else {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }

          const fetchRequest = event.request.clone();

          return fetch(fetchRequest).then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });

            return response;
          });
        })
    );
  }
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
