// Network-first: when online you always get the latest recipes.js / index.html,
// and the cached copy is used only when offline.
// Bump CACHE_NAME if you ever change the list of precached files.
const CACHE_NAME = 'recipes-cache-v2';
const FILES_TO_CACHE = [
  './',
  './index.html',
  './recipes.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      // All of the owner's GitHub Pages apps share one origin, so only touch our own caches.
      Promise.all(keys
        .filter(k => k.startsWith('recipes-cache-') && k !== CACHE_NAME)
        .map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(req)
      .then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then(cached => cached || caches.match('./index.html')))
  );
});
