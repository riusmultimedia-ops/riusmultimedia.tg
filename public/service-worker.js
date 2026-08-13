// RM Service Worker - Rius Multimédia
const CACHE_NAME = 'rm-v2-pwabuilder';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))
    )).then(()=> self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        if(networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic'){
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache=> cache.put(event.request, clone));
        }
        return networkResponse;
      }).catch(()=> cached);
      return cached || fetchPromise;
    })
  );
});
