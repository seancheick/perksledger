#!/usr/bin/env node
/*
 * Builds the installable PWA into dist/ from the artifact fragment (index.html).
 * The fragment stays the single source of truth; this wraps it in a full HTML
 * document, adds the manifest + service-worker registration, and stamps the
 * service-worker cache name with a content hash so deploys roll cleanly.
 *
 * Usage: node build-pwa.js [--cdn-font]   (icons are copied from ./icons)
 *   --cdn-font  extract the embedded Fraunces data-URI into a separate
 *               fraunces.woff2 file (smaller HTML, service-worker cached,
 *               zero third-party requests). The default build keeps the font
 *               inline for fully self-contained single-file use.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const cdnFont = process.argv.includes('--cdn-font');
const root = __dirname;
const dist = path.join(root, 'dist');
let frag = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
let fontFile = null;
if (cdnFont) {
  const m = frag.match(/src:url\(data:font\/woff2;base64,([^)]+)\) format\('woff2'\)/);
  if (m) {
    fontFile = Buffer.from(m[1], 'base64');
    frag = frag.replace(m[0], "src:url(fraunces.woff2) format('woff2')");
  }
}
const fontLinks = '';
const hash = crypto.createHash('sha256').update(frag).digest('hex').slice(0, 10);

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

const head = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Perks Ledger</title>
<meta name="description" content="Every credit, perk, and discount across your cards & memberships — tracked in one place.">
<meta name="theme-color" media="(prefers-color-scheme: light)" content="#F6F4EE">
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#121613">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="Perks">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Perks Ledger">
<meta property="og:title" content="Perks Ledger — stop leaving card perks on the table">
<meta property="og:description" content="Track every credit, perk, and discount across your cards & memberships. See what resets soon, what you're double-paying for, and what your wallet already covers. Free, no signup, data never leaves your browser.">
<meta property="og:url" content="https://perksledger.vercel.app">
<meta property="og:image" content="https://perksledger.vercel.app/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Perks Ledger — stop leaving card perks on the table">
<meta name="twitter:description" content="Every credit, perk, and discount across your cards & memberships — tracked in one place. Free, private, installable.">
<meta name="twitter:image" content="https://perksledger.vercel.app/og.png">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" sizes="192x192" href="icon-192.png">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
${fontLinks}</head>
<body>
`;

const swRegister = `
<script>
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then(reg => {
      reg.addEventListener('updatefound', () => {
        const w = reg.installing;
        if (!w) return;
        w.addEventListener('statechange', () => {
          if (w.state === 'activated' && navigator.serviceWorker.controller) {
            const d = document.createElement('div');
            d.style.cssText = 'position:fixed;left:50%;bottom:calc(24px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);background:#1C221E;color:#F6F4EE;padding:10px 20px;border-radius:999px;font:600 14px -apple-system,sans-serif;z-index:99;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.35)';
            d.textContent = 'New version ready — tap to reload';
            d.onclick = () => location.reload();
            document.body.appendChild(d);
            setTimeout(() => d.remove(), 20000);
          }
        });
      });
    }).catch(()=>{});
  });
}
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(dist, 'index.html'), head + frag + swRegister);

if (fontFile) fs.writeFileSync(path.join(dist, 'fraunces.woff2'), fontFile);
fs.writeFileSync(path.join(dist, 'robots.txt'), 'User-agent: *\nAllow: /\n');
fs.writeFileSync(path.join(dist, 'manifest.webmanifest'), JSON.stringify({
  id: 'perksledger',
  name: 'Perks Ledger',
  short_name: 'Perks',
  description: 'Every credit, perk, and discount across your cards & memberships — tracked in one place.',
  lang: 'en',
  categories: ['finance', 'utilities'],
  start_url: './',
  scope: './',
  display: 'standalone',
  background_color: '#F6F4EE',
  theme_color: '#136147',
  icons: [
    { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
  ]
}, null, 2));

const swAssets = ['index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png']
  .concat(fontFile ? ['fraunces.woff2'] : []);
fs.writeFileSync(path.join(dist, 'sw.js'), `/* Perks Ledger service worker — cache-first with background refresh */
const CACHE = 'perks-ledger-${hash}';
const ASSETS = ${JSON.stringify(swAssets)};
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
        if (res && res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
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
`);

for (const f of ['icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'og.png']) {
  fs.copyFileSync(path.join(root, 'icons', f), path.join(dist, f));
}
console.log('built dist/ (cache perks-ledger-' + hash + ')');
