// Network First Strategy
// Always fetches from server first — cache only used when offline
// When new version is deployed, users see it immediately

const CACHE = "yunqi-v3";

self.addEventListener("install", e => {
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  // Network first: always try server, fall back to cache if offline
  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Save fresh copy to cache
        var copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, copy));
        return response;
      })
      .catch(() => {
        // Offline fallback: use cached version
        return caches.match(e.request).then(r => r || caches.match("/index.html"));
      })
  );
});
