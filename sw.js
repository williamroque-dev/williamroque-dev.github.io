const CACHE_NAME = 'quotebook-v6';
const urlsToCache = [
  './',
  './index.html',
  './css/main.css',
  './js/constants.js',
  './js/database.js',
  './js/utils.js',
  './js/mobile-input.js',
  './js/install-prompt.js',
  './js/touch.js',
  './js/quote.js',
  './js/library.js',
  './js/app.js',
  './js/events.js',
  './assets/icon.png',
  './assets/apple-touch-icon.png',
  './manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for when the app comes back online
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle any background sync tasks here if needed
      console.log('Background sync triggered')
    );
  }
});

// Push notifications support (optional)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New update available',
    icon: './icon.png',
    badge: './icon.png'
  };

  event.waitUntil(
    self.registration.showNotification('Quotebook', options)
  );
});