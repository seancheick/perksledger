/* Perks Ledger service worker — cache-first with background refresh */
const CACHE = 'perks-ledger-5613c39989';
const ASSETS = ["index.html","welcome.html","manifest.webmanifest","icon-192.png","icon-512.png","apple-touch-icon.png","privacy.html","fonts/hanken.woff2","fonts/sentient-300.woff2","fonts/sentient-400.woff2","site/base.css","site/cards-1024.webp","site/cards-720.webp","site/tokens.css","site/wallet-1536.webp","site/wallet-800.webp","site/welcome.css"];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(cached => {
      const fresh = fetch(e.request).then(res => {
        if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
        return res;
      }).catch(() => cached);
      if (cached) return cached;
      if (e.request.mode === 'navigate') {
        return fresh.catch(() => caches.match('index.html')).then(r => r || caches.match('index.html'));
      }
      return fresh;
    })
  );
});
