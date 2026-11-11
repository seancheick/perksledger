#!/usr/bin/env node
/*
 * Builds the installable PWA into dist/ from the artifact fragment (index.html).
 * The fragment stays the single source of truth; this wraps it in a full HTML
 * document, adds the manifest + service-worker registration, and stamps the
 * service-worker cache name with a content hash so deploys roll cleanly.
 *
 * Usage: node build-pwa.js   (icons from ./icons, fonts from ./fonts, landing page from
 *   welcome.html + ./site). The --cdn-font flag is accepted for the existing Vercel build
 *   command and does nothing now: fonts are always self-hosted files.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = __dirname;
const dist = path.join(root, 'dist');
const frag = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const fonts = fs.readdirSync(path.join(root, 'fonts')).filter(f => f.endsWith('.woff2'));
const site = fs.readdirSync(path.join(root, 'site')).filter(f => !f.startsWith('.'));
const fontLinks = fonts.filter(f => /^(sentient-400|hanken)\.woff2$/.test(f))
  .map(f => `<link rel="preload" href="fonts/${f}" as="font" type="font/woff2" crossorigin>\n`).join('');
/* The cache name covers everything the service worker serves, so any change rolls out. */
const h = crypto.createHash('sha256').update(frag).update(fs.readFileSync(path.join(root, 'welcome.html')));
for (const f of site) h.update(fs.readFileSync(path.join(root, 'site', f)));
const hash = h.digest('hex').slice(0, 10);

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

const head = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Perks Ledger</title>
<meta name="description" content="Every credit, perk, and discount across your cards & memberships — tracked in one place.">
<meta name="theme-color" media="(prefers-color-scheme: light)" content="#F4F1EA">
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0E0E0D">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="Perks">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Perks Ledger">
<meta property="og:title" content="Perks Ledger — stop leaving card perks on the table">
<meta property="og:description" content="Track every credit, perk, and discount across your cards & memberships. See what resets soon, what you're double-paying for, and what your wallet already covers. Free during the beta, and your wallet data never leaves your browser.">
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

/* Update toast: catch waiting worker on load, updatefound, and activated;
   no auto-dismiss so slow readers don't miss it. */
const swRegister = `
<script>
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  addEventListener('load', () => {
    function showUpdateToast() {
      if (document.getElementById('swUpdateToast')) return;
      const d = document.createElement('button');
      d.type = 'button';
      d.id = 'swUpdateToast';
      d.className = 'sw-update';
      d.textContent = 'New version ready — tap to reload';
      d.onclick = () => location.reload();
      document.body.appendChild(d);
    }
    function watchWorker(w) {
      if (!w) return;
      w.addEventListener('statechange', () => {
        if ((w.state === 'installed' || w.state === 'activated') && navigator.serviceWorker.controller) {
          showUpdateToast();
        }
      });
    }
    navigator.serviceWorker.register('sw.js').then(reg => {
      if (reg.waiting && navigator.serviceWorker.controller) showUpdateToast();
      if (reg.installing) watchWorker(reg.installing);
      reg.addEventListener('updatefound', () => watchWorker(reg.installing));
      // Periodic check so long-lived tabs notice deploys
      setInterval(() => { try { reg.update(); } catch (e) {} }, 60 * 60 * 1000);
    }).catch(()=>{});
    // Only prompt on controller *replacement* (not first claim)
    let hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (hadController) showUpdateToast();
      hadController = true;
    });
  });
}
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(dist, 'index.html'), head + frag + swRegister);

fs.mkdirSync(path.join(dist, 'fonts'));
for (const f of fonts) fs.copyFileSync(path.join(root, 'fonts', f), path.join(dist, 'fonts', f));
fs.mkdirSync(path.join(dist, 'site'));
for (const f of site) fs.copyFileSync(path.join(root, 'site', f), path.join(dist, 'site', f));
fs.copyFileSync(path.join(root, 'welcome.html'), path.join(dist, 'welcome.html'));
fs.writeFileSync(path.join(dist, 'robots.txt'), 'User-agent: *\nAllow: /\n');
fs.copyFileSync(path.join(root, 'privacy.html'), path.join(dist, 'privacy.html'));
fs.copyFileSync(path.join(root, 'PRIVACY.md'), path.join(dist, 'PRIVACY.md'));
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
  background_color: '#F4F1EA',
  theme_color: '#141414',
  icons: [
    { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
  ]
}, null, 2));

const swAssets = ['index.html', 'welcome.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'privacy.html']
  .concat(fonts.map(f => 'fonts/' + f), site.map(f => 'site/' + f));
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
`);

for (const f of ['icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'og.png']) {
  fs.copyFileSync(path.join(root, 'icons', f), path.join(dist, f));
}
console.log('built dist/ (cache perks-ledger-' + hash + ')');
