const V = 'dte-v2';
const FILES = ['./', './index.html', './manifest.webmanifest', './inex-180.png', './inex-192.png', './inex-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Serve from cache instantly, refresh the cache in the background.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const net = fetch(e.request).then(res => {
        if (res.ok && new URL(e.request.url).origin === location.origin) {
          const copy = res.clone();
          caches.open(V).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || net;
    })
  );
});
