const CACHE_NAME = 'still-owed-public-v1';
const PUBLIC_SHELL = ['/', '/offline', '/privacy', '/terms', '/favicon.svg', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PUBLIC_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || request.destination === 'image') return;
  event.respondWith(
    fetch(request).catch(() => {
      if (request.mode === 'navigate') return caches.match('/offline');
      return caches.match(request);
    }),
  );
});