const CACHE_NAME = 'rg-exercise-cache-v3';
const ASSETS = [
  // Do not pre-cache dynamic HTML routes. Keep only static assets here.
  '/manifest.webmanifest',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  try {
    const req = event.request;
    const url = new URL(req.url);
    if (req.method !== 'GET') return;
    // Ignore non-http(s) schemes and cross-origin
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
    if (url.origin !== self.location.origin) return;

    const isDocument = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');

    if (isDocument) {
      // Network-first for HTML pages to avoid stale dynamic content
      event.respondWith(
        fetch(req)
          .then((response) => {
            // Optionally update cache with latest document
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone)).catch(() => {});
            return response;
          })
          .catch(() => caches.match(req).then((cached) => cached || caches.match('/')))
      );
      return;
    }

    // Cache-first for static assets
    event.respondWith(
      caches.match(req).then((cached) =>
        cached ||
          fetch(req).then((response) => {
            if (response && response.status === 200 && response.type === 'basic') {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(req, clone)).catch(() => {});
            }
            return response;
          })
      )
    );
  } catch (_) {
    // Ignore invalid URLs
  }
});
